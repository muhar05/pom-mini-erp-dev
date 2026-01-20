"use client";

import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export type StatCardData = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg?: string;
  gradientFrom?: string;
  growth?: string;
  growthIcon?: React.ElementType;
  growthColor?: string;
  description?: string;
};

interface StatCardProps {
  data: StatCardData[];
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  return (
    <>
      {data.map((card, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-r ${card.gradientFrom || ""} to-white dark:to-slate-700 p-0 border border-gray-200 dark:border-neutral-700 rounded-md shadow-none`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {card.value}
                </h3>
              </div>
              <div
                className={`w-12 h-12 ${card.iconBg || "bg-primary"} rounded-full flex items-center justify-center`}
              >
                <card.icon className="text-white" size={24} />
              </div>
            </div>
            {(card.growth || card.description) && (
              <div className="flex items-center gap-2 text-sm mt-4">
                {card.growth && card.growthIcon && (
                  <span
                    className={`flex items-center gap-1 ${card.growthColor || ""}`}
                  >
                    <card.growthIcon
                      fill="currentColor"
                      stroke="none"
                      width={14}
                      height={14}
                    />
                    {card.growth}
                  </span>
                )}
                {card.description && (
                  <span className="text-neutral-500 dark:text-neutral-400 text-[13px]">
                    {card.description}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default StatCard;
