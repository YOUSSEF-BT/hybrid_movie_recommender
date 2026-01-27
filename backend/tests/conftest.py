import sys
from pathlib import Path

# Ensure backend root is on sys.path so `app` package is importable
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
