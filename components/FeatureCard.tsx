import React from "react";
import { LucideIcon } from "lucide-react";
import styles from "./FeatureCard.module.css";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export function FeatureCard({ icon: Icon, title, description, badge }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <Icon size={20} />
        </div>
        {badge && (
          <span className={styles.badge}>
            {badge}
          </span>
        )}
      </div>
      <h3 className={styles.title}>
        {title}
      </h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
