import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from main6 import app
import uvicorn
uvicorn.run(app, host="0.0.0.0", port=80)
