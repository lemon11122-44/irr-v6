# 使用 Python 3.11 镜像
FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝源码
COPY . .

# 创建上传目录
RUN mkdir -p up6

# 暴露端口
EXPOSE 80

# 启动
CMD ["uvicorn", "main6:app", "--host", "0.0.0.0", "--port", "80"]
