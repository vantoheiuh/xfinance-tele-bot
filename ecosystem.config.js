module.exports = {
    apps: [
      {
        name: 'xfinance-bot', // Đặt tên cho ứng dụng của bạn
        script: './telebot.js', // Đường dẫn đến file chính của ứng dụng
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production'
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        cron_restart: '0 0 * * *', // Chạy lại ứng dụng vào mỗi ngày mới (0 giờ 0 phút)
      }
    ]
  };