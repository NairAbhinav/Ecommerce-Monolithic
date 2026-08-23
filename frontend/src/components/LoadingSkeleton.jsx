import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="glass rounded-2xl p-4 animate-pulse border border-slate-800">
      <div className="bg-slate-800 rounded-xl h-48 w-full mb-4"></div>
      <div className="h-4 bg-slate-800 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-slate-800 rounded w-1/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-800 rounded w-1/4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-slate-800 rounded-3xl h-[450px] w-full"></div>
        <div className="flex flex-col space-y-6">
          <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="h-20 bg-slate-800 rounded w-full"></div>
          <div className="h-10 bg-slate-800 rounded w-1/2 mt-4"></div>
        </div>
      </div>
    </div>
  );
};
