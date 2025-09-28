// app/api/chat/route.js - API 路由
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, history } = await request.json();
    
    // 模拟创建临时文件内容
    const historyContent = JSON.stringify(history);
    
    // 这里应该使用 Gradio 客户端，但由于 Vercel 限制，我们使用 fetch 直接调用 API
    const response = await fetch("https://55f765f839c495fbbc.gradio.live/run/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          historyContent, // 聊天历史
          message,        // 用户输入
          100,            // 最大生成长度
          0.7,            // 温度
          0.9,            // top_p
          1.0,            // 重复惩罚
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析返回的数据
    if (data && data.data && data.data.length > 0) {
      // 假设返回的是新的聊天历史
      const chatHistory = JSON.parse(data.data[0]);
      
      // 提取最新回复
      if (chatHistory && chatHistory.length > 0) {
        const lastExchange = chatHistory[chatHistory.length - 1];
        if (lastExchange.length > 1) {
          return NextResponse.json({ response: lastExchange[1] });
        }
      }
    }
    
    throw new Error('无效的响应格式');
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: error.message || '处理请求时发生错误' },
      { status: 500 }
    );
  }
}
