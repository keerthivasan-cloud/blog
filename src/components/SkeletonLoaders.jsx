import React from 'react';

export const MediaSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 animate-pulse">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="aspect-square rounded-[2.5rem] bg-slate-100 dark:bg-slate-800" />
    ))}
  </div>
);

export const SubscriberSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-20 rounded-2xl bg-slate-50 dark:bg-slate-850" />
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-40 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900" />
    ))}
  </div>
);

export const ArticleListItemSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-6 items-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    ))}
  </div>
);
