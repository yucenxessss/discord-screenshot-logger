require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.attachments.size) return;

    if (!WEBHOOK_URL) {
        console.log("❌ DISCORD_WEBHOOK_URL is missing.");
        return;
    }

    for (const attachment of message.attachments.values()) {
        const isImage =
            attachment.contentType?.startsWith("image/") ||
            /\.(png|jpg|jpeg|gif|webp)$/i.test(attachment.name || "");

        if (!isImage) continue;

        const embed = new EmbedBuilder()
            .setTitle("📸 Screenshot Logged")
            .setColor(0x5865F2)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL()
            })
            .addFields(
                {
                    name: "👤 User",
                    value: `${message.author}\n\`${message.author.id}\``,
                    inline: true
                },
                {
                    name: "📁 File",
                    value: attachment.name || "Unknown",
                    inline: true
                },
                {
                    name: "💬 Channel",
                    value: `${message.channel}`,
                    inline: true
                }
            )
            .setImage(attachment.url)
            .setTimestamp();

        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Screenshot Logger",
                embeds: [embed.toJSON()]
            })
        });

        console.log(`📸 Logged: ${attachment.name}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
