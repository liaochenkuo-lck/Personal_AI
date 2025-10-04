// 1. 后端代理接口地址（核心！已填入你的Vercel后端域名 + 接口路径）
// 格式：后端域名 + /api/chat（/api/chat是后端index.js中定义的接口路径）
const BACKEND_PROXY_URL = "personal-ai-rosy.vercel.app";

// 2. 获取前端DOM元素（对应index.html中的聊天区域、输入框、发送按钮）
const chatHistory = document.getElementById('chat-history'); // 聊天记录展示区
const userInput = document.getElementById('user-input');     // 用户输入框
const sendBtn = document.getElementById('send-btn');         // 发送按钮

// 3. 发送消息到后端（核心逻辑）
async function sendMessage() {
  // 3.1 过滤空消息（用户没输入内容时不发送请求）
  const userMessage = userInput.value.trim();
  if (!userMessage) {
    alert("请输入消息内容后再发送！");
    return;
  }

  // 3.2 先把用户消息显示到聊天界面
  addMessageToUI(userMessage, 'user');
  userInput.value = ''; // 清空输入框

  try {
    // 3.3 发送请求到后端代理（通过后端转发到火山引擎API）
    const response = await fetch(BACKEND_PROXY_URL, {
      method: 'POST', // 请求方式：POST（和后端接口定义一致）
      headers: {
        'Content-Type': 'application/json' // 告诉后端请求体是JSON格式
      },
      body: JSON.stringify({ message: userMessage }) // 把用户消息传给后端
    });

    // 3.4 解析后端返回的响应数据
    const responseData = await response.json();

    // 3.5 处理响应结果
    if (responseData.reply) {
      // 成功：显示AI的回复
      addMessageToUI(responseData.reply, 'ai');
    } else {
      // 失败：显示后端返回的错误信息（如Token无效、模型不存在）
      addMessageToUI(`❌ 错误：${responseData.error}`, 'ai');
    }

  } catch (error) {
    // 3.6 处理网络层面的错误（如后端挂了、跨域配置错）
    addMessageToUI(`❌ 请求失败：${error.message}`, 'ai');
    console.error("网络错误详情：", error); // 控制台打印详情，方便调试
  }
}

// 4. 把消息添加到聊天界面（美化展示）
function addMessageToUI(messageContent, messageRole) {
  // 创建一个消息容器
  const messageDiv = document.createElement('div');
  
  // 根据角色添加CSS类（区分用户消息和AI消息）
  if (messageRole === 'user') {
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<span class="user-label">你</span>：${messageContent}`;
  } else {
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `<span class="ai-label">AI</span>：${messageContent}`;
  }

  // 把消息添加到聊天记录区
  chatHistory.appendChild(messageDiv);
  
  // 自动滚动到底部（总是显示最新消息）
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// 5. 绑定事件（点击发送按钮 / 按回车键发送消息）
// 5.1 点击发送按钮
sendBtn.addEventListener('click', sendMessage);

// 5.2 按回车键发送（提升用户体验）
userInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
