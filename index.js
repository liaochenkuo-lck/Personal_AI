const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// 跨域配置：只允许你的前端域名访问
app.use(cors({
  origin: "https://liaochenkuo-lck.github.io" // 必须替换！如 "https://abc123.github.io"
}));
app.use(express.json());

// 火山引擎API配置（从Vercel环境变量读取Token）
const VOLC_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const VOLC_BEARER_TOKEN = process.env.VOLC_BEARER_TOKEN;

// 代理接口：/api/chat
app.post('https://personal-ai-rosy.vercel.app/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) return res.json({ error: "请输入消息" });

    // 构造请求体（和你的curl命令一致）
    const requestBody = JSON.stringify({
      "model": "doubao-1-5-thinking-pro-250415",
      "messages": [
        {"role": "system", "content": "你是人工智能助手."},
        {"role": "user", "content": userMessage}
      ]
    });

    // 调用火山引擎API
    const response = await fetch(VOLC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VOLC_BEARER_TOKEN}`
      },
      body: requestBody
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API调用失败");

    // 返回AI回复
    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.json({ error: error.message });
  }
});

// 启动服务
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`服务运行在端口 ${port}`);
});
