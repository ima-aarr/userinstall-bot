require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'button',
        description: 'メッセージ送信',
        contexts: [0, 1, 2],
        integration_types: [0, 1],
        options: [
            {
                name: 'message',
                description: '送信するメッセージ（\\n と入力すると改行されます）',
                type: ApplicationCommandOptionType.String,
                required: true 
            },
            {
                name: 'random_mention',
                description: 'Trueにすると、チャンネル内のユーザーを自動抽出してランダムメンションします',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    {
        name: 'poll',
        description: '投票を作成します',
        contexts: [0, 1, 2],
        integration_types: [0, 1]
    },
    {
        name: 'ping',
        description: 'Botの応答速度を確認します',
        contexts: [0, 1, 2],
        integration_types: [0, 1]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('スラッシュコマンドの登録を開始します...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('スラッシュコマンドの登録が完了しました！');
    } catch (error) {
        console.error('コマンドの登録中にエラーが発生しました:', error);
    }
})();
