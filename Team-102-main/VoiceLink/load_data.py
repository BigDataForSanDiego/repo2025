import subprocess

scripts = [
    r"data\scripts\food_pantry.py",
    r"data\scripts\parking_sleepsites.py",
    r"data\scripts\emergency_shelter.py",
    r"data\scripts\public_restrooms.py"
]

for script in scripts:
    print(f"Running {script}...")
    subprocess.run(["python", script], check=True)
    print(f"Finished {script}\n")