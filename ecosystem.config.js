module.exports = {
  apps: [
    {
      name: "alumni-backend",
      cwd: "/var/www/html/alumni-portal/backend",
      script: "src/app.js",
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5004,
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      error_file: "/var/www/html/alumni-portal/logs/backend-error.log",
      out_file: "/var/www/html/alumni-portal/logs/backend-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
