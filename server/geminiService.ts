import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface StoreContext {
  availableProducts?: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    inStock: boolean;
  }>;
  cartCount?: number;
  wishlistCount?: number;
}

const SYSTEM_INSTRUCTION = `You are "Shopaxe AI Concierge", an expert luxury personal shopper and support concierge for Shopaxe (https://shopaxe.store).
Shopaxe is an ultra-curated modern minimalist storefront offering premium apparel, tech & audio, home essentials, and lifestyle gear.

Key Brand & Store Guidelines:
1. Tone: Warm, refined, professional, concise, knowledgeable, and genuinely helpful.
2. Products:
   - "Aura Pro Wireless ANC Headphones" ($249) - Flagship noise cancelling, 40h battery, CNC milled aluminum.
   - "Heavyweight Organic French Terry Hoodie" ($140) - 480gsm organic cotton, boxy architectural drape, slate/chalk/charcoal colors.
   - "Minimalist Ceramic Pour-Over Dripper Set" ($75) - Matte stoneware, double-wall insulated carafe.
   - "Custom Mechanical Keyboard 75%" ($185) - CNC aluminum casing, hot-swappable tactile switches, gasket mount.
   - "Leather Minimalist Cardholder Wallet" ($48) - Full-grain vegetable tanned Italian leather.
   - "Solid Brass Desk Pen & Dock" ($62) - Precision lathe machined raw brass, refillable Schmidt rollerball.
   - "Organic Linen Duvet & Pillowcase Set" ($220) - 100% French stonewashed flax linen.
   - "Titanium Ultralight Thermal Tumbler 500ml" ($54) - Vacuum double-walled Grade-5 titanium.
3. Payment Methods:
   - Primary: Trust Wallet (USDT on BNB Smart Chain BEP-20, TRC-20, or Polygon) - fast instant verification.
   - We require verified on-chain transactions for order dispatch.
4. Shipping & Delivery:
   - Free worldwide and Pakistan express shipping on orders over $150.
   - Standard delivery: 2-4 business days. Tracking numbers are provided automatically.
5. Returns & Exchange:
   - 30-day hassle-free returns on all unworn items with original tags.
6. WhatsApp Support:
   - Live human agents are also available on WhatsApp 24/7 for urgent order inquiries or bulk requests.

Response Rules:
- Keep answers formatted cleanly with bullet points or bold text when comparing items.
- If recommending products, mention their exact price and why it fits the user's needs.
- If the user asks about payment, guide them through paying with Trust Wallet USDT securely.
- Never output markdown code blocks unless writing code. Keep conversations natural and elegant.`;

export async function generateChatResponse(
  messages: ChatMessage[],
  context?: StoreContext
): Promise<string> {
  const client = getAiClient();

  if (!client) {
    return generateSmartFallback(messages, context);
  }

  try {
    const formattedHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage ? lastMessage.content : 'Hello';

    let contextualPrompt = userPrompt;
    if (context?.availableProducts && context.availableProducts.length > 0) {
      contextualPrompt = `[Store Context: ${context.availableProducts.length} items in catalog, user has ${context.cartCount || 0} items in cart]\n\nUser Question: ${userPrompt}`;
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: contextualPrompt }] },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    if (response.text) {
      return response.text.trim();
    }

    return generateSmartFallback(messages, context);
  } catch (error) {
    console.error('Error generating AI response via Gemini API:', error);
    return generateSmartFallback(messages, context);
  }
}

function generateSmartFallback(messages: ChatMessage[], _context?: StoreContext): string {
  const lastQuery = (messages[messages.length - 1]?.content || '').toLowerCase();

  if (lastQuery.includes('crypto') || lastQuery.includes('trust wallet') || lastQuery.includes('usdt') || lastQuery.includes('pay')) {
    return `**How to pay with Trust Wallet (USDT) on Shopaxe:**

1. At checkout, review your order and select your preferred network (**BNB Smart Chain BEP-20**, **Tron TRC-20**, or **Polygon**).
2. Scan the merchant QR code or copy our receiving wallet address into your Trust Wallet app.
3. Transfer the exact USDT amount shown.
4. Paste the resulting **Transaction Hash (TxID)** into checkout and click **"Verify & Place Order"**.
5. Once validated on-chain, your receipt and tracking number will be generated immediately!`;
  }

  if (lastQuery.includes('track') || lastQuery.includes('order') || lastQuery.includes('where is my')) {
    return `To track your order, click the **"Track Order"** link in the top navigation or footer, then enter your Order ID (e.g., \`ORD-...\`). You will see real-time dispatch status, courier carrier, and delivery milestones.`;
  }

  if (lastQuery.includes('recommend') || lastQuery.includes('best') || lastQuery.includes('jacket') || lastQuery.includes('hoodie') || lastQuery.includes('audio') || lastQuery.includes('headphones')) {
    return `Here are our most acclaimed minimalist essentials:

• **Aura Pro Wireless ANC Headphones ($249)** — Flagship noise cancelling, aerospace-grade aluminum, 40hr battery life.
• **Heavyweight French Terry Hoodie ($140)** — 480gsm organic cotton with architectural boxy drape.
• **Minimalist Ceramic Pour-Over Dripper Set ($75)** — Handcrafted matte stoneware for coffee perfection.
• **Custom Mechanical Keyboard 75% ($185)** — CNC aluminum case with deep muted acoustics.

Would you like sizing advice or styling recommendations for any of these?`;
  }

  if (lastQuery.includes('return') || lastQuery.includes('refund') || lastQuery.includes('shipping')) {
    return `**Shopaxe Policies:**

• **Shipping:** Free worldwide and Pakistan express delivery on orders over $150 (standard 2–4 business days).
• **Returns:** 30-day money-back guarantee on all unworn items in original packaging.
• **Support:** Available 24/7 via this AI chat or directly with our human team on WhatsApp!`;
  }

  return `Welcome to **Shopaxe**! I'm your AI Concierge. I can help you with:

• Finding the right product, size, or material details
• Step-by-step guidance on **Trust Wallet (USDT)** payments
• Checking order status & tracking
• Recommending curated gift sets and bestsellers

How may I assist you today?`;
}
