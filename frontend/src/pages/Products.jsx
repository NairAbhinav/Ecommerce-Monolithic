import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SlidersHorizontal, ArrowUpDown, X, Star } from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/LoadingSkeleton.jsx';

const BRANDS = ['Apple', 'Samsung', 'Google Pixel', 'OnePlus', 'Sony', 'Spigen', 'Chargers'];
const RAM_OPTIONS = ['4GB', '8GB', '12GB', '16GB'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB'];
const OS_OPTIONS = ['iOS', 'Android'];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading, page, pages, totalProducts } = useSelector(
    (state) => state.products
  );

  // Local state for slide-out mobile filters panel
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync parameters from URL searchParams
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const sort = searchParams.get('sort') || 'latest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const ram = searchParams.get('ram') || '';
  const storage = searchParams.get('storage') || '';
  const os = searchParams.get('os') || '';
  const selectedBrands = searchParams.get('brand') ? searchParams.get('brand').split(',') : [];

  useEffect(() => {
    const params = {
      page: searchParams.get('page') || 1,
      limit: 8,
      search,
      category,
      subcategory,
      sort,
      minPrice,
      maxPrice,
      ram,
      storage,
      os,
      brand: searchParams.get('brand') || ''
    };
    dispatch(fetchProducts(params));
  }, [dispatch, searchParams]);

  // Update query params helper
  const updateQueryParam = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1'); // reset page on filter change
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const handleBrandChange = (brandName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    
    let brands = newParams.get('brand') ? newParams.get('brand').split(',') : [];
    if (brands.includes(brandName)) {
      brands = brands.filter((b) => b !== brandName);
    } else {
      brands.push(brandName);
    }

    if (brands.length > 0) {
      newParams.set('brand', brands.join(','));
    } else {
      newParams.delete('brand');
    }
    setSearchParams(newParams);
  };

  const handleClearAll = () => {
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800/80 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            {category || subcategory || 'All Offerings'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {search ? `Showing results for "${search}"` : `Explore our premium selection (${totalProducts} products)`}
          </p>
        </div>

        {/* Sort & Filter toggler row */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex md:hidden items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold w-1/2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Sort Selection */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 w-full md:w-auto">
            <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateQueryParam('sort', e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer pr-4"
            >
              <option value="latest" className="bg-slate-900">Latest Arrivals</option>
              <option value="popular" className="bg-slate-900">Best Sellers</option>
              <option value="priceAsc" className="bg-slate-900">Price: Low to High</option>
              <option value="priceDesc" className="bg-slate-900">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        
        {/* SIDEBAR FILTERS - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
            <span className="text-sm font-extrabold text-white uppercase tracking-wider">Filters</span>
            {(category || subcategory || minPrice || maxPrice || ram || storage || os || selectedBrands.length > 0 || search) && (
              <button
                onClick={handleClearAll}
                className="text-[10px] bg-red-950/40 border border-red-500/20 text-red-400 font-bold px-2 py-1 rounded-md hover:bg-red-950 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category Quick Filter */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
            <div className="flex flex-col gap-1.5 text-xs text-slate-300">
              <button
                onClick={() => updateQueryParam('category', '')}
                className={`text-left p-2 rounded-xl transition-colors ${!category ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-semibold' : 'hover:bg-slate-900'}`}
              >
                All Categories
              </button>
              <button
                onClick={() => updateQueryParam('category', 'Mobile Phones')}
                className={`text-left p-2 rounded-xl transition-colors ${category === 'Mobile Phones' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-semibold' : 'hover:bg-slate-900'}`}
              >
                Mobile Phones
              </button>
              <button
                onClick={() => updateQueryParam('category', 'Accessories')}
                className={`text-left p-2 rounded-xl transition-colors ${category === 'Accessories' ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-semibold' : 'hover:bg-slate-900'}`}
              >
                Accessories
              </button>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 border-t border-slate-900 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands</h3>
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
              {BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="w-4 h-4 rounded-md border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2 border-t border-slate-900 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price Limit (₹)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateQueryParam('minPrice', e.target.value)}
                className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              />
              <span className="text-slate-500 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateQueryParam('maxPrice', e.target.value)}
                className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Specifications Filters (Only when Mobile Phones category is active) */}
          {category === 'Mobile Phones' && (
            <>
              {/* RAM Filter */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">RAM</h3>
                <div className="flex flex-wrap gap-1.5">
                  {RAM_OPTIONS.map((val) => (
                    <button
                      key={val}
                      onClick={() => updateQueryParam('ram', ram === val ? '' : val)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        ram === val
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Filter */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Storage</h3>
                <div className="flex flex-wrap gap-1.5">
                  {STORAGE_OPTIONS.map((val) => (
                    <button
                      key={val}
                      onClick={() => updateQueryParam('storage', storage === val ? '' : val)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        storage === val
                          ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* OS Filter */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operating System</h3>
                <div className="flex flex-col gap-2">
                  {OS_OPTIONS.map((val) => (
                    <label key={val} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white">
                      <input
                        type="radio"
                        checked={os === val}
                        onChange={() => updateQueryParam('os', val)}
                        onClick={() => { if (os === val) updateQueryParam('os', ''); }}
                        className="w-4 h-4 rounded-full border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

        </aside>

        {/* PRODUCTS GRID SECTION */}
        <main className="flex-grow space-y-8">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold border transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page === pages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State Screen */
            <div className="glass rounded-3xl border border-slate-850 p-12 text-center max-w-lg mx-auto mt-12 space-y-4">
              <span className="text-4xl">🔍</span>
              <h2 className="text-base font-bold text-white">No Matching Products Found</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We couldn't find any products matching your specific query. Try clearing filters or broadening search parameters.
              </p>
              <button
                onClick={handleClearAll}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
              >
                Reset Store Settings
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER SLIDE-OVER PANEL */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-105 flex md:hidden">
          {/* Overlay background */}
          <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)}></div>
          
          {/* Slider Menu */}
          <div className="relative w-80 max-w-xs ml-auto bg-dark-950 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-800 animate-in slide-in-from-right duration-350 z-110">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-sm font-extrabold text-white uppercase tracking-wider">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</h3>
                <div className="flex flex-col gap-1 text-xs">
                  <button
                    onClick={() => { updateQueryParam('category', ''); setMobileFiltersOpen(false); }}
                    className={`text-left p-2 rounded-xl ${!category ? 'bg-blue-600/10 text-blue-400 font-semibold' : ''}`}
                  >
                    All Categories
                  </button>
                  <button
                    onClick={() => { updateQueryParam('category', 'Mobile Phones'); setMobileFiltersOpen(false); }}
                    className={`text-left p-2 rounded-xl ${category === 'Mobile Phones' ? 'bg-blue-600/10 text-blue-400 font-semibold' : ''}`}
                  >
                    Mobile Phones
                  </button>
                  <button
                    onClick={() => { updateQueryParam('category', 'Accessories'); setMobileFiltersOpen(false); }}
                    className={`text-left p-2 rounded-xl ${category === 'Accessories' ? 'bg-blue-600/10 text-blue-400 font-semibold' : ''}`}
                  >
                    Accessories
                  </button>
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Brands</h3>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="w-4 h-4 rounded-md border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price limits */}
              <div className="space-y-2 border-t border-slate-900 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Price (₹)</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateQueryParam('minPrice', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateQueryParam('maxPrice', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-900 flex gap-3">
              <button
                onClick={handleClearAll}
                className="w-1/2 py-2.5 text-xs font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
