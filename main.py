import os
import sys
import socket
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.monitor import SystemMonitor

def get_resource_path(relative_path: str) -> str:
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

app = FastAPI(title="Sakura PC Hardware Monitor")

frontend_path = get_resource_path("frontend")
app.mount("/frontend", StaticFiles(directory=frontend_path), name="frontend")

@app.get("/")
async def serve_dashboard():
    index_file = os.path.join(frontend_path, "index.html")
    return FileResponse(index_file)

monitor = SystemMonitor()
pc_name = socket.gethostname()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    import psutil
    psutil.cpu_percent(interval=None)
    
    tick_counter = 0
    try:
        await websocket.send_json({
            "type": "init",
            "pc_name": pc_name
        })

        while True:
            tick_counter += 1
            include_storage = (tick_counter % 5 == 0)
            
            data = monitor.get_all_metrics(include_storage=include_storage)
            
            payload = {
                "type": "update",
                "data": data
            }
            
            await websocket.send_json(payload)
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        # Client terputus secara normal
        pass
    except (asyncio.CancelledError, RuntimeError, ConnectionResetError, OSError):
        # Client terputus mendadak / browser di-refresh / layar HP mati
        pass
    except Exception as e:
        # Hanya cetak jika ada error internal yang tidak berkaitan dengan koneksi putus
        print(f"WebSocket Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")