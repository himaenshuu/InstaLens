import { ProfileData } from "../services/api";

/**
 * Format large numbers with K, M, B suffixes
 */
function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Calculate engagement rate
 */
function calculateEngagementRate(posts: any[], followers: number): string {
  if (!posts || posts.length === 0 || followers === 0) return "0%";

  const totalEngagement = posts.reduce((sum, post) => {
    return sum + (post.likes || 0) + (post.comments || 0);
  }, 0);

  const avgEngagement = totalEngagement / posts.length;
  const rate = (avgEngagement / followers) * 100;

  return rate.toFixed(2) + "%";
}

/**
 * Generate and download PDF report for Instagram profile
 */
export async function generatePDFReport(
  profileData: ProfileData & { posts?: any[]; reels?: any[] },
  username: string
): Promise<void> {
  // Create a simple HTML structure for the report
  const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>InstaLens Report - @${username}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #8b5cf6;
    }
    
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .report-date {
      color: #6b7280;
      font-size: 14px;
    }
    
    .profile-section {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 40px;
      padding: 30px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    
    .profile-info h1 {
      font-size: 28px;
      margin-bottom: 5px;
      color: #111827;
    }
    
    .username {
      color: #6b7280;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .verified-badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .bio {
      margin-top: 15px;
      color: #4b5563;
      font-size: 14px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #8b5cf6;
      margin-bottom: 5px;
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #111827;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .engagement-section {
      margin-bottom: 40px;
    }
    
    .engagement-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .metric-box {
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
    }
    
    .metric-title {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
    }
    
    .posts-section {
      margin-bottom: 40px;
    }
    
    .posts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    
    .post-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .post-stats {
      display: flex;
      gap: 15px;
      margin-top: 10px;
      font-size: 14px;
      color: #6b7280;
    }
    
    .post-stat {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">InstaLens</div>
    <div class="report-date">Instagram Analytics Report - ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="profile-section">
    <div class="profile-info">
      <h1>${profileData.name || username}</h1>
      <div class="username">@${username}</div>
      ${
        profileData.isVerified
          ? '<span class="verified-badge">✓ Verified</span>'
          : ""
      }
      ${profileData.bio ? `<div class="bio">${profileData.bio}</div>` : ""}
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${formatNumber(profileData.followers || 0)}</div>
      <div class="stat-label">Followers</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatNumber(profileData.following || 0)}</div>
      <div class="stat-label">Following</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${formatNumber(
        profileData.postsCount ||
          (typeof profileData.posts === "number" ? profileData.posts : 0)
      )}</div>
      <div class="stat-label">Posts</div>
    </div>
  </div>

  <div class="engagement-section">
    <h2 class="section-title">Engagement Metrics</h2>
    <div class="engagement-metrics">
      <div class="metric-box">
        <div class="metric-title">Engagement Rate</div>
        <div class="metric-value">${calculateEngagementRate(
          profileData.posts || [],
          profileData.followers || 0
        )}</div>
      </div>
      <div class="metric-box">
        <div class="metric-title">Total Posts</div>
        <div class="metric-value">${
          Array.isArray(profileData.posts) ? profileData.posts.length : 0
        }</div>
      </div>
      <div class="metric-box">
        <div class="metric-title">Total Reels</div>
        <div class="metric-value">${
          Array.isArray(profileData.reels) ? profileData.reels.length : 0
        }</div>
      </div>
      <div class="metric-box">
        <div class="metric-title">Avg Likes per Post</div>
        <div class="metric-value">${formatNumber(
          Array.isArray(profileData.posts) && profileData.posts.length > 0
            ? profileData.posts.reduce((sum, p) => sum + (p.likes || 0), 0) /
                profileData.posts.length
            : 0
        )}</div>
      </div>
    </div>
  </div>

  ${
    Array.isArray(profileData.posts) && profileData.posts.length > 0
      ? `
  <div class="posts-section">
    <h2 class="section-title">Recent Posts (Top 9)</h2>
    <div class="posts-grid">
      ${profileData.posts
        .slice(0, 9)
        .map(
          (post, index) => `
        <div class="post-card">
          <strong>Post ${index + 1}</strong>
          <div class="post-stats">
            <div class="post-stat">❤️ ${formatNumber(post.likes || 0)}</div>
            <div class="post-stat">💬 ${formatNumber(post.comments || 0)}</div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
            ${post.timestamp || "Recently"}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Generated by InstaLens - Instagram Analytics Platform</p>
    <p>Report generated for @${username} on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;

  // Create a new window and print
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow popups.");
  }

  printWindow.document.write(reportHTML);
  printWindow.document.close();

  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}
