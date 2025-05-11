"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/lib/config';

interface Restaurant {
  id: string;
  name: string;
  imageURL: string;
  cuisine: string;
  rating: number;
  ratePerPerson: number;
}

export interface SearchState {
  location: string;
  state?: string;
  date: Date | undefined;
  time: string;
  people: number;
  searchQuery?: string;
  zip?: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems?: number;
}

// Move ApiRestaurant type to top-level scope
type ApiRestaurant = {
  restaurant_id?: string | number;
  id?: string | number;
  name: string;
  photos?: string[];
  cuisine_type: string;
  rating?: number;
  cost_rating?: number;
};

interface RestaurantContextType {
  restaurants: Restaurant[];
  setRestaurants: React.Dispatch<React.SetStateAction<Restaurant[]>>;
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  isLoading: boolean;
  error: string | null;
  searchForRestaurants: () => Promise<void>;
  pagination: PaginationState;
  fetchHotRestaurants: (currentPage: number) => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  isSearchActive: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  
  const [searchState, setSearchState] = useState<SearchState>({
    location: 'San Francisco',
    state: '',
    date: undefined,
    time: '19:00',
    people: 1,
    searchQuery: '',
    zip: '',
  });
  
  // Function to ensure time is in 24-hour format
  const formatTimeTo24Hour = (timeStr: string): string => {
    // If already in 24-hour format, return as is
    if (timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return timeStr;
    }
    
    // Try to parse AM/PM format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = match[3]?.toUpperCase();
      
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Format hours to have leading zero if needed
      const formattedHours = hours.toString().padStart(2, '0');
      return `${formattedHours}:${minutes}`;
    }
    
    // If we can't parse, return the original string
    return timeStr;
  };
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 12,
    totalPages: 1
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Fetch hot restaurants when component mounts
  useEffect(() => {
    fetchHotRestaurants(pagination.page);
  }, []);

  // Use useCallback for functions passed as props
  const fetchHotRestaurants = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSearchActive(false);
      
      // Get the current page at the time of the call
      // const currentPage = pagination.page;
      
      const url = getApiUrl(`restaurants/hot/?page=${currentPage}&pageSize=${pagination.pageSize}`);
      console.log("Fetching hot restaurants from URL with page=", currentPage, ":", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hot restaurants');
      }
      
      const data = await response.json();
      console.log("Hot restaurants API response:", data);
      
      // Use ApiRestaurant in mapRestaurant
      const mapRestaurant = (r: ApiRestaurant) => ({
        id: r.restaurant_id?.toString() || r.id?.toString() || '',
        name: r.name,
        imageURL: (r.photos && r.photos.length > 0) ? r.photos[0] : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500",
        cuisine: r.cuisine_type,
        rating: r.rating || 0,
        ratePerPerson: r.cost_rating || 0,
      });
      if (data.results) {
        setRestaurants(data.results.map(mapRestaurant));
      } else if (Array.isArray(data)) {
        setRestaurants(data.map(mapRestaurant));
      } else {
        setRestaurants([mapRestaurant(data)]);
      }
      
      // Update pagination based on API response format
      if (data.pagination) {
        // Handle the standard pagination object format
        console.log("Found pagination object:", data.pagination);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.currentPage || currentPage,
          totalPages: data.pagination.totalPages || 1,
          pageSize: data.pagination.pageSize || prev.pageSize,
          totalItems: data.pagination.totalCount
        }));
      } else if (data.totalPages) {
        // Handle direct pagination properties
        console.log("Found direct pagination properties, totalPages:", data.totalPages);
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: data.totalPages
        }));
      } else if (data.count) {
        // Some APIs return count instead of totalPages
        const totalPages = Math.ceil(data.count / pagination.pageSize);
        console.log("Calculating totalPages from count:", data.count, "=", totalPages);
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: totalPages,
          totalItems: data.count
        }));
      } else {
        // If we can't determine pagination, use the results length
        console.log("No pagination data found, using results length for single page");
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: 1
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching hot restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageSize]);

  const nextPage = useCallback(() => {
    console.log("Next page clicked. Current page:", pagination.page, "Total pages:", pagination.totalPages);
    
    if (pagination.page < pagination.totalPages) {
      const nextPageNum = pagination.page + 1;
      console.log("Moving to next page:", nextPageNum);
      
      if (isSearchActive) {
        // Ensure time is in 24-hour format
        const timeIn24HourFormat = formatTimeTo24Hour(searchState.time);
        
        // Use the updated page when making the API call
        const params = new URLSearchParams({
          city: searchState.location,
          state: searchState.state || '',
          date: searchState.date ? new Date(searchState.date).toISOString().split('T')[0] : '',
          time: timeIn24HourFormat,
          people: searchState.people.toString(),
          page: String(nextPageNum),
          pageSize: String(pagination.pageSize)
        });
        
        // Add searchQuery if it exists
        if (searchState.searchQuery) {
          params.append('query', searchState.searchQuery);
        }
        
        if (searchState.zip) {
          params.append('zip', searchState.zip);
        }
        
        const url = getApiUrl(`restaurants/search/?${params.toString()}`);
        console.log("Fetching next page from URL with page=", nextPageNum, ":", url);
        
        setIsLoading(true);
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch restaurants');
          return response.json();
        })
        .then(data => {
          console.log("Next page response:", data);
          
          // Update restaurants data
          const mapRestaurant = (r: ApiRestaurant) => ({
            id: r.restaurant_id?.toString() || r.id?.toString() || '',
            name: r.name,
            imageURL: (r.photos && r.photos.length > 0) ? r.photos[0] : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500",
            cuisine: r.cuisine_type,
            rating: r.rating || 0,
            ratePerPerson: r.cost_rating || 0,
          });
          if (data.results) {
            setRestaurants(data.results.map(mapRestaurant));
          } else if (Array.isArray(data)) {
            setRestaurants(data.map(mapRestaurant));
          } else {
            setRestaurants([mapRestaurant(data)]);
          }
          
          // Update pagination state AFTER getting the response
          if (data.pagination) {
            console.log("Setting page from pagination response:", data.pagination.currentPage || nextPageNum);
            setPagination(prev => ({
              ...prev,
              page: data.pagination.currentPage || nextPageNum,
              totalPages: data.pagination.totalPages || prev.totalPages,
              pageSize: data.pagination.pageSize || prev.pageSize,
              totalItems: data.pagination.totalCount || prev.totalItems
            }));
          } else {
            // If no pagination data in response, at least update the page number
            console.log("No pagination in response, setting page to:", nextPageNum);
            setPagination(prev => ({
              ...prev,
              page: nextPageNum
            }));
          }
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error fetching next page:', err);
          // Reset pagination on error
          setPagination(prev => ({
            ...prev,
            page: pagination.page // Stay on current page
          }));
        })
        .finally(() => {
          setIsLoading(false);
        });
      } else {
        // For hot restaurants, update page before fetch
        console.log(nextPageNum)
        setPagination(prev => ({
          ...prev,
          page: nextPageNum
        }));
        fetchHotRestaurants(nextPageNum);
      }
    } else {
      console.log("Already at last page, not proceeding");
    }
  }, [isSearchActive, pagination.page, pagination.pageSize, pagination.totalPages, searchState, fetchHotRestaurants, formatTimeTo24Hour]);

  const prevPage = useCallback(() => {
    console.log("Previous page clicked. Current page:", pagination.page);
    
    if (pagination.page > 1) {
      const prevPageNum = pagination.page - 1;
      console.log("Moving to previous page:", prevPageNum);
      
      if (isSearchActive) {
        // Ensure time is in 24-hour format
        const timeIn24HourFormat = formatTimeTo24Hour(searchState.time);
        
        // Use the updated page when making the API call
        const params = new URLSearchParams({
          city: searchState.location,
          state: searchState.state || '',
          date: searchState.date ? new Date(searchState.date).toISOString().split('T')[0] : '',
          time: timeIn24HourFormat,
          people: searchState.people.toString(),
          page: String(prevPageNum),
          pageSize: String(pagination.pageSize)
        });
        
        // Add searchQuery if it exists
        if (searchState.searchQuery) {
          params.append('query', searchState.searchQuery);
        }
        
        if (searchState.zip) {
          params.append('zip', searchState.zip);
        }
        
        const url = getApiUrl(`restaurants/search/?${params.toString()}`);
        console.log("Fetching previous page from URL with page=", prevPageNum, ":", url);
        
        setIsLoading(true);
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch restaurants');
          return response.json();
        })
        .then(data => {
          console.log("Previous page response:", data);
          
          // Update restaurants data
          const mapRestaurant = (r: ApiRestaurant) => ({
            id: r.restaurant_id?.toString() || r.id?.toString() || '',
            name: r.name,
            imageURL: (r.photos && r.photos.length > 0) ? r.photos[0] : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500",
            cuisine: r.cuisine_type,
            rating: r.rating || 0,
            ratePerPerson: r.cost_rating || 0,
          });
          if (data.results) {
            setRestaurants(data.results.map(mapRestaurant));
          } else if (Array.isArray(data)) {
            setRestaurants(data.map(mapRestaurant));
          } else {
            setRestaurants([mapRestaurant(data)]);
          }
          
          // Update pagination state AFTER getting the response
          if (data.pagination) {
            console.log("Setting page from pagination response:", data.pagination.currentPage || prevPageNum);
            setPagination(prev => ({
              ...prev,
              page: data.pagination.currentPage || prevPageNum,
              totalPages: data.pagination.totalPages || prev.totalPages,
              pageSize: data.pagination.pageSize || prev.pageSize,
              totalItems: data.pagination.totalCount || prev.totalItems
            }));
          } else {
            // If no pagination data in response, at least update the page number
            console.log("No pagination in response, setting page to:", prevPageNum);
            setPagination(prev => ({
              ...prev,
              page: prevPageNum
            }));
          }
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error fetching previous page:', err);
          // Reset pagination on error
          setPagination(prev => ({
            ...prev,
            page: pagination.page // Stay on current page
          }));
        })
        .finally(() => {
          setIsLoading(false);
        });
      } else {
        // For hot restaurants, update page before fetch
        setPagination(prev => ({
          ...prev,
          page: prevPageNum
        }));
        fetchHotRestaurants(prevPageNum);
      }
    } else {
      console.log("Already at first page, not proceeding");
    }
  }, [isSearchActive, pagination.page, pagination.pageSize, searchState, fetchHotRestaurants, formatTimeTo24Hour]);

  const searchForRestaurants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSearchActive(true);
      
      // Reset to page 1 for new searches
      const currentPage = 1;
      
      console.log("Searching for restaurants with state:", searchState, "Page:", currentPage);
      
      // Ensure time is in 24-hour format
      const timeIn24HourFormat = formatTimeTo24Hour(searchState.time);
      
      // For GET requests with query parameters
      const params = new URLSearchParams({
        city: searchState.location,
        state: searchState.state || '',
        date: searchState.date ? new Date(searchState.date).toISOString().split('T')[0] : '',
        time: timeIn24HourFormat,
        people: searchState.people.toString(),
        page: String(currentPage),
        pageSize: String(pagination.pageSize)
      });    
      
      // Add searchQuery if it exists
      if (searchState.searchQuery) {
        params.append('query', searchState.searchQuery);
      }
      
      if (searchState.zip) {
        params.append('zip', searchState.zip);
      }
      
      const url = getApiUrl(`restaurants/search/?${params.toString()}`);
      console.log("Fetching search restaurants from URL with page=", currentPage, ":", url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      
      const data = await response.json();
      console.log("Search restaurants API response:", data);
      
      // Check for results array or direct data
      const mapRestaurant = (r: ApiRestaurant) => ({
        id: r.restaurant_id?.toString() || r.id?.toString() || '',
        name: r.name,
        imageURL: (r.photos && r.photos.length > 0) ? r.photos[0] : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png?20210521171500",
        cuisine: r.cuisine_type,
        rating: r.rating || 0,
        ratePerPerson: r.cost_rating || 0,
      });
      if (data.results) {
        setRestaurants(data.results.map(mapRestaurant));
      } else if (Array.isArray(data)) {
        setRestaurants(data.map(mapRestaurant));
      } else {
        setRestaurants([mapRestaurant(data)]);
      }
      
      // Update pagination based on API response format
      if (data.pagination) {
        // Handle the standard pagination object format
        console.log("Found pagination object:", data.pagination);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.currentPage || currentPage,
          totalPages: data.pagination.totalPages || 1,
          pageSize: data.pagination.pageSize || prev.pageSize,
          totalItems: data.pagination.totalCount
        }));
      } else if (data.totalPages) {
        // Handle direct pagination properties
        console.log("Found direct pagination properties, totalPages:", data.totalPages);
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: data.totalPages
        }));
      } else if (data.count) {
        // Some APIs return count instead of totalPages
        const totalPages = Math.ceil(data.count / pagination.pageSize);
        console.log("Calculating totalPages from count:", data.count, "=", totalPages);
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: totalPages,
          totalItems: data.count
        }));
      } else {
        // If we can't determine pagination, use the results length
        console.log("No pagination data found, using results length for single page");
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          totalPages: 1
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching search restaurants:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageSize, searchState]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        setRestaurants,
        searchState,
        setSearchState,
        isLoading,
        error,
        searchForRestaurants,
        pagination,
        fetchHotRestaurants,
        nextPage,
        prevPage,
        isSearchActive
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};