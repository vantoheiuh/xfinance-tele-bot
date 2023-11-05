module.exports = {
    apps: [
      {
        name: 'auto-commit1', // Đặt tên cho ứng dụng của bạn
        script: './auto-commit.js', // Đường dẫn đến file chính của ứng dụng
        instances: 1,
        autorestart: false,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production'
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        cron_restart: '0 0 * * *', // Chạy lại ứng dụng vào mỗi ngày mới (0 giờ 0 phút)
      }
    ]
  };