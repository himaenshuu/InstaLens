import { useState, useEffect, useRef } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { apiService } from "../services/api";
import { createProxiedImageUrl } from "../utils/imageProxy";

interface Profile {
  username: string;
  display_name: string;
  profile_image_url: string;
  followers_count: number;
  is_verified: boolean;
}

interface SearchWithSuggestionsProps {
  onSearch: (username: string) => void;
  isLoading?: boolean;
}

export function SearchWithSuggestions({
  onSearch,
  isLoading,
}: SearchWithSuggestionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load profiles on component mount
  useEffect(() => {
    const loadProfiles = async () => {
      const savedProfiles = await apiService.getProfiles();
      setProfiles(savedProfiles);
    };
    loadProfiles();
  }, []);

  // Filter profiles based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProfiles([]);
      return;
    }

    const filtered = profiles.filter(
      (profile) =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProfiles(filtered);
  }, [searchTerm, profiles]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (username: string) => {
    setSearchTerm(username);
    setShowSuggestions(false);
    onSearch(username);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for influencer (e.g., cristiano)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          disabled={isLoading}
          className="pl-10 pr-4 h-12 bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-all"
        />
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredProfiles.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Previously Scraped
            </div>
            {filteredProfiles.map((profile) => (
              <button
                key={profile.username}
                onClick={() => handleSuggestionClick(profile.username)}
                className="w-full px-3 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <img
                  src={createProxiedImageUrl(profile.profile_image_url)}
                  alt={profile.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = createProxiedImageUrl(
                      `https://ui-avatars.com/api/?name=${profile.display_name}&background=6366f1&color=fff`,
                    );
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate">
                      {profile.display_name}
                    </span>
                    {profile.is_verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{profile.username} •{" "}
                    {formatFollowers(profile.followers_count)} followers
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        searchTerm.trim() !== "" &&
        filteredProfiles.length === 0 &&
        profiles.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground"
          >
            No saved profiles match "{searchTerm}". Press Enter to search.
          </div>
        )}
    </div>
  );
}
