import { useState } from "react";
import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import {
  Input,
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Label
} from "@/components/ui";
import type { BusinessAnalysis, SearchFilterProps, FilterOptions } from "@/types";

interface SearchFilterProps {
  analyses: BusinessAnalysis[];
  onFilteredResults: (filtered: BusinessAnalysis[]) => void;
}

export function SearchFilter({ analyses, onFilteredResults }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 10]);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const applyFilters = () => {
    let filtered = [...analyses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.businessModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.targetMarket?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.revenueStream?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply score range filter
    filtered = filtered.filter(
      (a) =>
        (a.overallScore || 0) >= scoreRange[0] &&
        (a.overallScore || 0) <= scoreRange[1]
    );

    // Apply stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter(
        (a) => a.currentStage === parseInt(stageFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score-high":
          return (b.overallScore || 0) - (a.overallScore || 0);
        case "score-low":
          return (a.overallScore || 0) - (b.overallScore || 0);
        case "date-new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-old":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "stage-high":
          return (b.currentStage || 1) - (a.currentStage || 1);
        case "stage-low":
          return (a.currentStage || 1) - (b.currentStage || 1);
        default:
          return 0;
      }
    });

    // Update active filters display
    const filters = [];
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    if (scoreRange[0] > 0 || scoreRange[1] < 10) {
      filters.push(`Score: ${scoreRange[0]}-${scoreRange[1]}`);
    }
    if (stageFilter !== "all") {
      filters.push(`Stage: ${stageFilter}`);
    }
    setActiveFilters(filters);

    onFilteredResults(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setScoreRange([0, 10]);
    setStageFilter("all");
    setSortBy("date");
    setActiveFilters([]);
    onFilteredResults(analyses);
  };

  // Auto-apply filters when values change
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, scoreRange, stageFilter, sortBy]);

  return (
    <div className="space-y-4" data-testid="search-filter">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-vc-text-muted" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by URL, business model, market, or revenue stream..."
            className="pl-10 bg-vc-dark border-vc-border text-vc-text placeholder:text-vc-text-muted"
            data-testid="input-search"
          />
        </div>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="bg-vc-card border-vc-border text-vc-text hover:border-vc-primary"
              data-testid="button-filters"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="ml-2 bg-vc-primary/20 text-vc-primary">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-vc-card border-vc-border">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-vc-text">Score Range</Label>
                <div className="flex items-center space-x-3">
                  <span className="text-vc-text-muted text-sm">{scoreRange[0]}</span>
                  <Slider
                    value={scoreRange}
                    onValueChange={setScoreRange}
                    max={10}
                    step={1}
                    className="flex-1"
                    data-testid="slider-score"
                  />
                  <span className="text-vc-text-muted text-sm">{scoreRange[1]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-vc-text">Workflow Stage</Label>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="bg-vc-dark border-vc-border text-vc-text" data-testid="select-stage">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent className="bg-vc-card border-vc-border">
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="1">1 - Discovery</SelectItem>
                    <SelectItem value="2">2 - Filter</SelectItem>
                    <SelectItem value="3">3 - MVP</SelectItem>
                    <SelectItem value="4">4 - Testing</SelectItem>
                    <SelectItem value="5">5 - Scaling</SelectItem>
                    <SelectItem value="6">6 - Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-vc-text">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-vc-dark border-vc-border text-vc-text" data-testid="select-sort">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-vc-card border-vc-border">
                    <SelectItem value="date-new">Date (Newest)</SelectItem>
                    <SelectItem value="date-old">Date (Oldest)</SelectItem>
                    <SelectItem value="score-high">Score (High to Low)</SelectItem>
                    <SelectItem value="score-low">Score (Low to High)</SelectItem>
                    <SelectItem value="stage-high">Stage (6 to 1)</SelectItem>
                    <SelectItem value="stage-low">Stage (1 to 6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full border-vc-border text-vc-text hover:bg-vc-dark"
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] bg-vc-card border-vc-border text-vc-text" data-testid="select-quick-sort">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent className="bg-vc-card border-vc-border">
            <SelectItem value="date-new">Newest First</SelectItem>
            <SelectItem value="date-old">Oldest First</SelectItem>
            <SelectItem value="score-high">Highest Score</SelectItem>
            <SelectItem value="score-low">Lowest Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-vc-primary/20 text-vc-primary border-vc-primary/30"
            >
              {filter}
            </Badge>
          ))}
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-vc-text-muted hover:text-vc-text"
            data-testid="button-clear-inline"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-vc-text-muted">
        Showing {analyses.length} {analyses.length === 1 ? 'result' : 'results'}
      </div>
    </div>
  );
}

// React is imported automatically by Vite
import React from 'react';