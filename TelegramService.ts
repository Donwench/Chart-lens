export class TelegramService {
  /** Fetch available chats the bot is part of */
  static async getChats() {
    try {
      const res = await fetch("/api/telegram/chats");
      const data = await res.json();
      return data.chats || [];
    } catch (error) {
      console.error("Failed to fetch Telegram chats", error);
      return [];
    }
  }

  /** Send a markdown message to a specific chat */
  static async sendAlert(chatId: string, message: string) {
    if (!chatId || !message) return { success: false, error: "Missing chat ID or message" };
    
    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      });
      return await res.json();
    } catch (error) {
      console.error("Failed to send Telegram alert", error);
      return { success: false, error };
    }
  }

  /** Get persisted chat ID globally */
  static getSelectedChatId(): string | null {
    return localStorage.getItem("telegram_chat_id");
  }

  /** Set persisted chat ID */
  static setSelectedChatId(chatId: string) {
    localStorage.setItem("telegram_chat_id", chatId);
  }

  /** Check if auto-forwarding is enabled */
  static isAutoForwardingEnabled(): boolean {
    return localStorage.getItem("telegram_forwarding") === "true";
  }

  /** Toggle auto-forwarding */
  static setAutoForwarding(enabled: boolean) {
    localStorage.setItem("telegram_forwarding", String(enabled));
  }
}
