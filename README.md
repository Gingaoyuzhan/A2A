# Career Royale - 职场大逃杀

> AI 驱动的模拟面试游戏，让 AI 替身代你直面面试官的灵魂拷问。

## 项目简介

Career Royale 是一款将求职面试游戏化的 Web 应用。用户输入简历和目标职位描述，选择难度模式后，观看 AI 模拟的面试"战斗"过程，最终获得胜率预测和详细评价。

### 核心特性

- **游戏化面试体验** - HP 条、伤害值、回合制对战
- **AI 实时生成** - 基于简历和 JD 动态生成面试问答
- **SSE 流式传输** - 实时展示面试对话过程
- **双难度模式** - Easy（友善 HR）/ Hard（阿里 P8 压力测试）

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Tailwind CSS |
| 后端 | NestJS + TypeScript |
| AI | Qwen (阿里云 DashScope) / OpenAI 兼容 |
| 通信 | SSE (Server-Sent Events) |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Gingaoyuzhan/A2A.git
cd A2A
```

### 2. 配置后端

```bash
cd backend
npm install

# 复制环境变量模板并配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 API Key
```

### 3. 配置前端

```bash
cd ../career-royale
npm install
```

### 4. 启动服务

```bash
# 终端 1 - 后端
cd backend
npm run start:dev

# 终端 2 - 前端
cd career-royale
npm run dev
```

访问 http://localhost:5173

## 项目结构

```
A2A/
├── backend/                 # NestJS 后端
│   └── src/
│       ├── modules/
│       │   ├── battle/      # 战斗逻辑
│       │   └── ai/          # AI 服务
│       └── common/          # 通用模块
└── career-royale/           # Vue 前端
    └── src/
        ├── views/           # 页面组件
        ├── components/      # UI 组件
        └── services/        # 业务服务
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/battle/start` | 创建战斗 |
| GET | `/api/battle/:id` | 获取战斗状态 |
| GET | `/api/battle/:id/stream` | SSE 流式战斗 |

## 环境变量

```env
# AI API 配置
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus

# 服务端口
PORT=4000
```

## License

MIT
