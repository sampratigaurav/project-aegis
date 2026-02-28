from setuptools import setup, find_packages

setup(
    name="aegis-sdk",
    version="0.1.0",
    description="CLI and SDK for Project Aegis - The Trust Layer for AI Models",
    author="Aegis",
    packages=find_packages(),
    install_requires=[
        "typer>=0.9.0",
        "requests>=2.31.0",
        "rich>=13.7.0",
        "modelscan>=0.6.2",
    ],
    entry_points={
        "console_scripts": [
            "aegis=aegis_sdk.cli:app",
        ],
    },
)
