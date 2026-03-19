require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});


const buttonDataCache = new Map();


function generateRandomString(length = 25) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


function generateRandomEmojis(count = 8) {
    const emojis = ['😀','😂','🥰','😎','🤔','😭','😡','👍','👎','✨','🔥','🎉','🌟','🍕','🐱','🐶','🚀','🌈','🍎','⚽','💯','👽','👻','🤖','👾','💀','🤡','👽','💩','👀'];
    let result = '';
    for (let i = 0; i < count; i++) {
        result += emojis[Math.floor(Math.random() * emojis.length)];
    }
    return result;
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('ready', () => {
    console.log(`${client.user.tag} が起動しました！`);
});

client.on('interactionCreate', async interaction => {
    

    if (interaction.isChatInputCommand()) {
        

        if (interaction.commandName === 'ping') {
            const sent = await interaction.reply({ content: 'Ping測定中...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            await interaction.editReply(`Pong! れいてんし: **${latency}ms**\nAPIの遅延: **${client.ws.ping}ms**`);
            return;
        }

    
        if (interaction.commandName === 'poll') {
     
            const baseQuestion = "https://discord.gg/UKxrw7rFzn"; 
            
          
            const baseChoices = [
                "https://discord.gg/UKxrw7rFzn",
                "https://discord.gg/7e6em8ZmQY",
                "https://discord.gg/t946jJsHwB",
                "https://discord.gg/cgUyBSq7aM"
            ];

            const questionWithEmojis = `${baseQuestion} ${generateRandomEmojis(8)}`;
            const emojisMarks = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
            let description = '';
            

            baseChoices.forEach((choice, index) => {
                description += `${emojisMarks[index]} ${choice} ${generateRandomEmojis(8)}\n\n`;
            });

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`投票: ${questionWithEmojis}`)
                .setDescription(description)
                .setTimestamp();

            const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });


            for (let i = 0; i < baseChoices.length; i++) {
                await pollMessage.react(emojisMarks[i]);
            }
            return;
        }


        if (interaction.commandName === 'button') {
            const rawMessage = interaction.options.getString('message');
            const customMessage = rawMessage.replace(/\\n/g, '\n');
            const isRandomMention = interaction.options.getBoolean('random_mention') ?? false;
            

            const buttonId = `btn_${interaction.id}`;
            

            buttonDataCache.set(buttonId, { text: customMessage, mention: isRandomMention });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(buttonId)
                    .setLabel('メッセージを送信')
                    .setStyle(ButtonStyle.Danger)
            );
            
            const mentionStatus = isRandomMention ? "ON" : "OFF";
            await interaction.reply({ 
                content: `以下のボタンを押すと指定したメッセージが送信されます。\n（ランダムメンション: ${mentionStatus}）\n\n**【登録したメッセージ】**\n${customMessage}`, 
                components: [row] 
            });
            return;
        }
    }


    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        const buttonConfig = buttonDataCache.get(interaction.customId);


        if (!buttonConfig) {
            return interaction.reply({ content: '期限切れです。もう一度ボタンコマンドで作成してください。', ephemeral: true });
        }

        await interaction.reply({ content: '送信を開始します...', ephemeral: true });

        const { text: baseMessage, mention: isRandomMention } = buttonConfig;
        let userIds = [];

        // ランダムメンションおなかすいた
        if (isRandomMention) {
            try {
                const messages = await interaction.channel.messages.fetch({ limit: 50 });
                userIds = Array.from(new Set(messages.map(m => m.author.id)));
            } catch (error) {
                console.error('ユーザー抽出に失敗:', error);
            }
        }

     
        for (let i = 0; i < 6; i++) {
            try {
                let finalMessage = baseMessage;

                if (isRandomMention && userIds.length > 0) {
                    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
                    finalMessage = `<@${randomUserId}> ${finalMessage}`;
                }

                finalMessage = `${finalMessage}\n${generateRandomString(25)}`;
                
                await interaction.channel.send(finalMessage);

                const jitter = Math.floor(Math.random() * (1500 - 700 + 1)) + 700;
                await wait(jitter);
                
            } catch (error) {
                console.error('メッセージ送信中にエラーが発生しました:', error);
                break; 
            }
        }
    }
});


process.on('unhandledRejection', error => {
    console.error('未処理のエラー:', error);
});
process.on('uncaughtException', error => {
    console.error('予期せぬエラー:', error);
});

client.login(process.env.DISCORD_TOKEN);
