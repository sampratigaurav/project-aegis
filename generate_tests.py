import torch
import os
import io

class MaliciousPayload(object):
    def __reduce__(self):
        # The arbitrary code execution payload that modelscan will catch
        return (os.system, ('echo "System compromised by malicious PyTorch weights!"',))

def generate_all_test_files():
    print("Generating Project Aegis Test Models...")

    # ---------------------------------------------------------
    # 1. LEGIT MODEL (.pt)
    # ---------------------------------------------------------
    legit_data = {
        "model_name": "SimpleNN",
        "weights": torch.tensor([0.12, 0.88, -0.45, 0.91]),
        "bias": torch.tensor([0.05])
    }
    torch.save(legit_data, "legit_model.pt")
    print("✅ Created: legit_model.pt (Safe)")

    # ---------------------------------------------------------
    # 2. MALICIOUS MODEL (.pt)
    # ---------------------------------------------------------
    malicious_data = {
        "model_name": "SimpleNN",
        "weights": MaliciousPayload() 
    }
    torch.save(malicious_data, "malicious_model.pt")
    print("🚨 Created: malicious_model.pt (Contains payload)")

    # ---------------------------------------------------------
    # 3. TAMPERED MODEL (.pt)
    # ---------------------------------------------------------
    buffer = io.BytesIO()
    torch.save(legit_data, buffer)
    
    # Append a single space byte to alter the hash without breaking the file
    content = bytearray(buffer.getvalue())
    content.append(ord(' ')) 
    
    with open("tampered_model.pt", "wb") as f:
        f.write(content)
    print("⚠️ Created: tampered_model.pt (Hash altered)")

if __name__ == "__main__":
    generate_all_test_files()
