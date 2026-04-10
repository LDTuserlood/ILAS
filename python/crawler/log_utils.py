from datetime import datetime

def log_step(message: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {message}", flush=True)
