/**
 * 飞书机器人 Webhook 通知服务
 */

interface FeishuWebhookConfig {
  webhookUrl: string;
  secret?: string;
}

interface AlertData {
  title: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
  timestamp?: Date;
}

export class FeishuNotificationService {
  private config: FeishuWebhookConfig;

  constructor(config: FeishuWebhookConfig) {
    this.config = config;
  }

  /**
   * 发送 webhook 消息
   */
  async sendWebhook(alertData: AlertData): Promise<boolean> {
    try {
      const payload = this.formatAlert(alertData);
      
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.code !== undefined && result.code !== 0) {
        console.error('Feishu webhook returned error:', result);
        return false;
      }

      console.log('Successfully sent Feishu notification');
      return true;
    } catch (error) {
      console.error('Error sending Feishu notification:', error);
      return false;
    }
  }

  /**
   * 格式化消息为飞书卡片格式
   */
  private formatAlert(alertData: AlertData): any {
    const { title, message, level = 'info' } = alertData;

    const colorMap: Record<string, string> = {
      error: 'red',
      warning: 'orange',
      info: 'blue',
    };

    return {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          template: colorMap[level],
          title: { content: title, tag: 'plain_text' },
        },
        elements: [
          {
            tag: 'div',
            text: { content: message, tag: 'lark_md' },
          },
        ],
      },
    };
  }
}

export { FeishuWebhookConfig, AlertData };
