import psutil
import time
import winreg
import pynvml
import win32gui
import win32process
import win32api
import wmi
import socket

class SystemMonitor:
    def __init__(self):
        self.net_io_last = psutil.net_io_counters()
        self.net_time_last = time.time()
        
        # Inisialisasi WMI (Windows Management Instrumentation)
        self.w = wmi.WMI()
        
        # Deteksi GPU NVIDIA
        try:
            pynvml.nvmlInit()
            self.gpu_supported = True
            self.gpu_handle = pynvml.nvmlDeviceGetHandleByIndex(0)
            self.gpu_name = pynvml.nvmlDeviceGetName(self.gpu_handle)
        except pynvml.NVMLError:
            self.gpu_supported = False
            self.gpu_name = "Not Supported / No NVIDIA GPU"

        # Caching CPU Model untuk menghindari overhead registry reading setiap detik
        self.cpu_model = self._get_cpu_model()

    def _get_cpu_model(self):
        try:
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
            model, _ = winreg.QueryValueEx(key, "ProcessorNameString")
            return model.strip()
        except:
            return platform.processor()

    def get_cpu_info(self):
        freq = psutil.cpu_freq()
        return {
            "model": self.cpu_model,
            "usage_percent": psutil.cpu_percent(interval=None),
            "usage_per_core": psutil.cpu_percent(interval=None, percpu=True),
            "clock_speed_ghz": round(freq.current / 1000, 2) if freq else 0.0,
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cores": psutil.cpu_count(logical=True)
        }

    def get_ram_info(self):
        mem = psutil.virtual_memory()
        return {
            "total_gb": round(mem.total / (1024**3), 2),
            "used_gb": round(mem.used / (1024**3), 2),
            "available_gb": round(mem.available / (1024**3), 2),
            "usage_percent": mem.percent
        }

    def get_gpu_info(self):
        if not self.gpu_supported:
            return {"supported": False, "name": self.gpu_name}
        
        try:
            utilization = pynvml.nvmlDeviceGetUtilizationRates(self.gpu_handle)
            memory = pynvml.nvmlDeviceGetMemoryInfo(self.gpu_handle)
            temp = pynvml.nvmlDeviceGetTemperature(self.gpu_handle, pynvml.NVML_TEMPERATURE_GPU)
            
            return {
                "supported": True,
                "name": self.gpu_name,
                "usage_percent": utilization.gpu,
                "temp_c": temp,
                "vram_total_gb": round(memory.total / (1024**3), 2),
                "vram_used_gb": round(memory.used / (1024**3), 2),
                "vram_usage_percent": round((memory.used / memory.total) * 100, 1)
            }
        except Exception:
            return {"supported": False, "name": "Error reading GPU"}

    def get_network_info(self):
        current_io = psutil.net_io_counters()
        current_time = time.time()
        
        time_delta = current_time - self.net_time_last
        if time_delta == 0: time_delta = 1
        
        dl_speed = (current_io.bytes_recv - self.net_io_last.bytes_recv) / time_delta
        ul_speed = (current_io.bytes_sent - self.net_io_last.bytes_sent) / time_delta
        
        self.net_io_last = current_io
        self.net_time_last = current_time
        
        return {
            "dl_speed_mbs": round(dl_speed / (1024**2), 2),
            "ul_speed_mbs": round(ul_speed / (1024**2), 2),
            "total_dl_gb": round(current_io.bytes_recv / (1024**3), 2),
            "total_ul_gb": round(current_io.bytes_sent / (1024**3), 2)
        }

    def get_storage_info(self):
        drives = []
        for part in psutil.disk_partitions(all=False):
            if 'cdrom' in part.opts or part.fstype == '':
                continue
            try:
                usage = psutil.disk_usage(part.mountpoint)
                drives.append({
                    "device": part.device,
                    "total_gb": round(usage.total / (1024**3), 2),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "percent": usage.percent
                })
            except PermissionError:
                continue
        return drives

    def get_top_processes(self):
        processes = []
        for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                if p.info['cpu_percent'] is not None and p.info['cpu_percent'] > 0:
                    processes.append({
                        "pid": p.info['pid'],
                        "name": p.info['name'],
                        "cpu_percent": round(p.info['cpu_percent'], 1),
                        "memory_mb": round(p.info['memory_info'].rss / (1024**2), 1)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by CPU usage and get top 5
        processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:5]
        return processes

    def get_display_and_active_app(self):
        # 1. Active Window Detection via pywin32
        app_name = "Unknown"
        window_title = "Unknown"
        try:
            hwnd = win32gui.GetForegroundWindow()
            if hwnd:
                window_title = win32gui.GetWindowText(hwnd)
                _, pid = win32process.GetWindowThreadProcessId(hwnd)
                app_name = psutil.Process(pid).name()
        except Exception:
            pass

        # 2. Display Info (Resolution & Refresh Rate)
        monitors = []
        try:
            i = 0
            while True:
                device = win32api.EnumDisplayDevices(None, i)
                if not device:
                    break
                if device.StateFlags & 1: # Flag 1 indicates active attached monitor
                    settings = win32api.EnumDisplaySettings(device.DeviceName, win32api.ENUM_CURRENT_SETTINGS)
                    monitors.append({
                        "name": device.DeviceString,
                        "resolution": f"{settings.PelsWidth} x {settings.PelsHeight}",
                        "refresh_rate": f"{settings.DisplayFrequency} Hz"
                    })
                i += 1
        except Exception:
            pass

        return {
            "active_app_name": app_name,
            "active_window_title": window_title,
            "monitors": monitors
        }

    def get_all_metrics(self, include_storage=False):
        data = {
            "cpu": self.get_cpu_info(),
            "ram": self.get_ram_info(),
            "gpu": self.get_gpu_info(),
            "network": self.get_network_info(),
            "processes": self.get_top_processes(),
            "display": self.get_display_and_active_app()
        }
        if include_storage:
            data["storage"] = self.get_storage_info()
        return data