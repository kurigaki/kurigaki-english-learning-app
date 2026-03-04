const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

export function getStreakMilestone(streak: number, previousStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

export function getStreakMilestoneMessage(milestone: number): { emoji: string; title: string; description: string } {
  switch (milestone) {
    case 3:
      return { emoji: "🌱", title: "3日連続達成!", description: "良いスタートです！この調子で続けましょう" };
    case 7:
      return { emoji: "🔥", title: "1週間連続!", description: "素晴らしい継続力！習慣化の第一歩です" };
    case 14:
      return { emoji: "⭐", title: "2週間連続!", description: "すごい！もう学習が習慣になっていますね" };
    case 30:
      return { emoji: "🏆", title: "1ヶ月連続!", description: "驚異的な継続力！あなたは本物の学習者です" };
    case 50:
      return { emoji: "💎", title: "50日連続!", description: "圧倒的な努力！尊敬に値します" };
    case 100:
      return { emoji: "👑", title: "100日連続!", description: "伝説の学習者！この領域に達する人はほとんどいません" };
    default:
      return { emoji: "🎉", title: `${milestone}日連続!`, description: "素晴らしい継続です！" };
  }
}