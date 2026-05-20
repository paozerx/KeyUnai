"use client";

import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

interface GameSuggestion {
  id: number;
  title: string;
  platform: string;
  price: string;
  cover_image_url: string;
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = searchParams;
    if (params) {
      setTerm(params.get('search') || '');
    }
  }, [searchParams]);

  const fetchSuggestions = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/games/?search=${encodeURIComponent(trimmed)}`,
        { signal: controller.signal }
      );
      if (!res.ok) throw new Error('Failed to fetch');
      const data: GameSuggestion[] = await res.json();
      const results = data.slice(0, 8);
      setSuggestions(results);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!term.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(term);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [term, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateToSearch = (query: string) => {
    const trimmed = query.trim();
    setIsOpen(false);
    if (trimmed) {
      router.push(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(term);
  };

  const selectSuggestion = (game: GameSuggestion) => {
    setTerm(game.title);
    setIsOpen(false);
    router.push(`/games/${game.id}`);
  };

  const clearSearch = () => {
    setTerm('');
    setSuggestions([]);
    setIsOpen(false);
    router.push('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-40 sm:w-56 md:w-72 lg:w-80 min-w-0 shrink-0">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => term.trim() && suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="ค้นหาเกม..."
          className="w-full h-9 sm:h-10 pl-9 pr-16 sm:pr-20 text-sm bg-slate-800/80 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-slate-500 animate-spin mx-1" />
          )}
          {term && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors active:scale-95"
            aria-label="ค้นหา"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {isOpen && term.trim() && !isLoading && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl z-[60] text-sm text-slate-400">
          ไม่พบเกมที่ตรงกับ &quot;{term}&quot;
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-1.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl shadow-black/40 overflow-hidden z-[60] max-h-80 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((game, index) => (
            <li key={game.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onClick={() => selectSuggestion(game)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === activeIndex ? 'bg-slate-800' : 'hover:bg-slate-800/70'
                }`}
              >
                <div className="w-8 h-10 shrink-0 rounded overflow-hidden bg-slate-800">
                  {game.cover_image_url ? (
                    <img
                      src={game.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-600">
                      N/A
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{game.title}</p>
                  <p className="text-xs text-slate-500 uppercase">{game.platform}</p>
                </div>
                <span className="text-sm font-bold text-emerald-400 shrink-0 tabular-nums">
                  ฿{parseFloat(game.price).toLocaleString()}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
