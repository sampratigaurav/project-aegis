import typer
import requests
import hashlib
from rich.console import Console
from rich.table import Table
from rich import print as rprint
import os

app = typer.Typer(help="Aegis CLI - The Trust Layer for AI Models")
console = Console()

AEGIS_API_URL = os.getenv("AEGIS_API_URL", "https://project-aegis-production.up.railway.app")
# For local testing, users can export AEGIS_API_URL="http://localhost:8000"

TOKEN_FILE = os.path.expanduser("~/.aegis_token")

def save_token(token: str):
    """Save the JWT token to the local file."""
    with open(TOKEN_FILE, "w") as f:
        f.write(token)
    os.chmod(TOKEN_FILE, 0o600)  # Restrict permissions

def load_token() -> str:
    """Load the JWT token from the local file."""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as f:
            return f.read().strip()
    return None

def compute_sha256(file_path: str) -> str:
    """Compute the SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read in chunks to handle large files efficiently
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


@app.command()
def verify(
    model_path: str = typer.Argument(..., help="Path to the model file to verify (.pt, .pkl, etc.)")
):
    """
    Verify the cryptographic integrity of a local model against the Aegis Blockchain Registry.
    """
    if not os.path.exists(model_path):
        console.print(f"[bold red]Error:[/bold red] File '{model_path}' not found.")
        raise typer.Exit(code=1)

    with console.status(f"[bold blue]Computing SHA-256 hash for {model_path}...[/bold blue]"):
        try:
            file_hash = compute_sha256(model_path)
        except Exception as e:
            console.print(f"[bold red]Error computing hash:[/bold red] {e}")
            raise typer.Exit(code=1)

    console.print(f"Generated Hash: [bold cyan]{file_hash}[/bold cyan]")
    
    with console.status("[bold blue]Verifying against Aegis Blockchain Registry...[/bold blue]"):
        try:
            response = requests.post(
                f"{AEGIS_API_URL}/verify",
                json={"file_hash": file_hash},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("is_authentic") and data.get("is_registered"):
                    console.print("\n[bold green][SUCCESS] Authentic Model[/bold green]")
                    
                    table = Table(show_header=False, box=None)
                    table.add_row("[bold]Publisher:[/bold]", data.get("publisher_email", data.get("publisher", "Unknown")))
                    
                    # Handle timestamp formatting safely
                    timestamp = data.get("timestamp")
                    if timestamp:
                        if isinstance(timestamp, (int, float)):
                            import datetime
                            dt = datetime.datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
                            table.add_row("[bold]Registered At:[/bold]", dt)
                        else:
                            table.add_row("[bold]Registered At:[/bold]", str(timestamp))
                    
                    tx_hash = data.get("tx_hash")
                    if tx_hash:
                        table.add_row("[bold]Blockchain TX:[/bold]", f"[cyan]{tx_hash}[/cyan]")
                        
                    console.print(table)
                else:
                    console.print("\n[bold red][FAILED] Tampered or Unregistered Model[/bold red]")
                    console.print("This model's hash does not match any record in the Aegis blockchain registry.")
                    console.print("It may have been modified or is a malicious copy. Do not trust this file.")
                    raise typer.Exit(code=1)
                    
            else:
                console.print(f"[bold red]Verification Failed:[/bold red] Server returned HTTP {response.status_code}")
                if response.text:
                    console.print(response.text)
                raise typer.Exit(code=1)
                
        except requests.exceptions.RequestException as e:
            console.print(f"\n[bold red]Network Error:[/bold red] Could not connect to Aegis API.\n{e}")
            raise typer.Exit(code=1)


@app.command()
def login(
    email: str = typer.Option(..., "--email", "-e", prompt="Email address", help="Your Aegis account email"),
    password: str = typer.Option(..., "--password", "-p", prompt="Password", hide_input=True, help="Your Aegis account password")
):
    """
    Authenticate with the Aegis API and save the session token locally.
    """
    with console.status("[bold blue]Authenticating...[/bold blue]"):
        try:
            response = requests.post(
                f"{AEGIS_API_URL}/auth/login",
                data={"username": email, "password": password},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                save_token(token)
                console.print(f"\n[bold green][SUCCESS][/bold green] Successfully logged in as {email}!")
                console.print("Your session token has been securely stored. You can now use `aegis register`.")
            else:
                console.print("\n[bold red][FAILED][/bold red] Login failed. Please check your credentials.")
                try:
                    console.print(response.json().get("detail", ""))
                except:
                    pass
                raise typer.Exit(code=1)
                
        except requests.exceptions.RequestException as e:
            console.print(f"\n[bold red]Network Error:[/bold red] Could not connect to Aegis API.\n{e}")
            raise typer.Exit(code=1)


@app.command()
def register(
    model_path: str = typer.Argument(..., help="Path to the model file to register"),
    name: str = typer.Option(None, "--name", "-n", help="Name of the model (defaults to filename)"),
    description: str = typer.Option(None, "--desc", "-d", help="Description of the model"),
    token: str = typer.Option(None, "--token", "-t", envvar="AEGIS_TOKEN", help="Aegis API Token (optional if logged in)")
):
    """
    Securely scan and register a local model to the Aegis Blockchain.
    """
    # Resolve token
    auth_token = token or load_token()
    if not auth_token:
        console.print("[bold red]Error: You must be logged in to register models.[/bold red]")
        console.print("Run [cyan]`aegis login`[/cyan] to authenticate, or provide a token via --token or AEGIS_TOKEN env var.")
        raise typer.Exit(code=1)

    if not os.path.exists(model_path):
        console.print(f"[bold red]Error:[/bold red] File '{model_path}' not found.")
        raise typer.Exit(code=1)

    model_name = name if name else os.path.basename(model_path)
    
    # Step 1: Local Security Scan
    with console.status("[bold blue]Running local ModelScan security check...[/bold blue]"):
        try:
            from modelscan.modelscan import ModelScan
            scanner = ModelScan()
            scan_result = scanner.scan(model_path)
            
            issues = getattr(scan_result, 'issues', [])
            if hasattr(issues, 'all_issues'):
                issues = issues.all_issues
                
            has_critical = False
            for issue in issues:
                severity = getattr(issue, 'severity', 'UNKNOWN')
                if hasattr(severity, 'name'):
                    severity = severity.name
                if str(severity).upper() in ['CRITICAL', 'HIGH']:
                    has_critical = True
                    console.print(f"[bold red]Found {severity} vulnerability:[/bold red] {issue}")
            
            if has_critical:
                console.print("\n[bold red][ABORTED] Registration Aborted: Malicious code detected in model.[/bold red]")
                raise typer.Exit(code=1)
                
            scan_status = "Passed (CLI Local Scan)"
            console.print("[bold green][SUCCESS] Security Scan Passed[/bold green] (No critical vulnerabilities found)")
            
        except ImportError:
            console.print("[yellow]Warning: modelscan not installed locally. Skipping deep scan.[/yellow]")
            scan_status = "Skipped (modelscan not installed)"
        except Exception as e:
            console.print(f"[bold red]Error during scanning:[/bold red] {e}")
            import traceback
            console.print(traceback.format_exc())
            scan_status = "Skipped (Scan Error)"
            console.print("[yellow]Warning: Local scan failed due to an error. Proceeding with registration anyway.[/yellow]")

    # Step 2: Compute Hash
    with console.status(f"[bold blue]Computing SHA-256 hash...[/bold blue]"):
        file_hash = compute_sha256(model_path)
    
    console.print(f"Generated Hash: [bold cyan]{file_hash}[/bold cyan]")
    
    # Step 3: Register via API
    with console.status("[bold blue]Registering model on Aegis Blockchain via API...[/bold blue]"):
        try:
            headers = {"Authorization": f"Bearer {auth_token}"}
            payload = {
                "name": model_name,
                "description": description,
                "file_hash": file_hash,
                "scan_status": scan_status
            }
            
            response = requests.post(
                f"{AEGIS_API_URL}/register-cli",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                console.print("\n[bold green][SUCCESS] Model Successfully Registered![/bold green]")
                
                table = Table(show_header=False, box=None)
                table.add_row("[bold]Model Name:[/bold]", data.get("name"))
                table.add_row("[bold]File Hash:[/bold]", f"[cyan]{data.get('file_hash')}[/cyan]")
                
                tx_hash = data.get("tx_hash")
                if tx_hash:
                    table.add_row("[bold]Blockchain TX:[/bold]", f"[cyan]{tx_hash}[/cyan]")
                    console.print(table)
                    console.print(f"\n[bold]View on PolygonScan:[/bold] https://amoy.polygonscan.com/tx/{tx_hash}")
                else:
                    table.add_row("[bold]Status:[/bold]", "Registered in DB (Blockchain pending)")
                    console.print(table)
            else:
                console.print(f"\n[bold red]Registration Failed ({response.status_code}):[/bold red]")
                try:
                    err_data = response.json()
                    console.print(err_data.get("detail", response.text))
                except:
                    console.print(response.text)
                raise typer.Exit(code=1)
                
        except requests.exceptions.RequestException as e:
            console.print(f"\n[bold red]Network Error:[/bold red] Could not connect to Aegis API.\n{e}")
            raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
