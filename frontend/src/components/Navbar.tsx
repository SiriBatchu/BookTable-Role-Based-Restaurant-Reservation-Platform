// components/Navbar.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Users, MapPin, ChevronDown, LogOut, User, Clock } from "lucide-react";
import Link from "next/link";
import DateSelector from "./ui/DateSelector";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {useRestaurant} from "@/context/RestaurantContext";

// Simplified cities list
const cities = [
  "San Francisco",
  "New York",
  "Los Angeles",
  "Chicago",
  "Seattle",
  "Austin",
  "Boston",
  "Denver",
  "Portland",
  "Miami",
  "Washington, D.C.",
  "Philadelphia",
  "San Diego",
  "Atlanta",
  "San Jose"
];

// Time slots for reservation
const timeSlots = [
  "11:00 AM", "11:30 AM", 
  "12:00 PM", "12:30 PM", 
  "1:00 PM", "1:30 PM", 
  "2:00 PM", "2:30 PM", 
  "3:00 PM", "3:30 PM", 
  "4:00 PM", "4:30 PM", 
  "5:00 PM", "5:30 PM", 
  "6:00 PM", "6:30 PM", 
  "7:00 PM", "7:30 PM", 
  "8:00 PM", "8:30 PM", 
  "9:00 PM", "9:30 PM", 
  "10:00 PM"
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const currentPage = pathname.split("/").pop();
  // console.log(currentPage);

  const { searchState, setSearchState, searchForRestaurants } = useRestaurant();

  const [isPeopleDropdownOpen, setIsPeopleDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const timeButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLocationDropdownOpen &&
        locationDropdownRef.current && 
        !locationDropdownRef.current.contains(event.target as Node) &&
        locationButtonRef.current &&
        !locationButtonRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
      
      if (
        isTimeDropdownOpen &&
        timeDropdownRef.current && 
        !timeDropdownRef.current.contains(event.target as Node) &&
        timeButtonRef.current &&
        !timeButtonRef.current.contains(event.target as Node)
      ) {
        setIsTimeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLocationDropdownOpen, isTimeDropdownOpen]);

  // Use useCallback for handlers to prevent unnecessary re-renders
  const handlePeopleSelect = useCallback((count: number) => {
    setSearchState(prevState => ({
      ...prevState,
      people: count,
    }));
    setIsPeopleDropdownOpen(false);
  }, [setSearchState]);

  const handleLocationSelect = useCallback((city: string) => {
    setSearchState(prevState => ({
      ...prevState,
      location: city,
    }));
    setIsLocationDropdownOpen(false);
  }, [setSearchState]);
  
  const handleTimeSelect = useCallback((time: string) => {
    setSearchState(prevState => ({
      ...prevState,
      time: time,
    }));
    setIsTimeDropdownOpen(false);
  }, [setSearchState]);

  const handleSearchQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState(prevState => ({
      ...prevState,
      searchQuery: e.target.value,
    }));
  }, [setSearchState]);

  const peopleOptions = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="w-full">
      {/* Top navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and location */}
        <div className="flex items-center space-x-6 relative">
          <Link href="/">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-[#fc8019] rounded-full flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2L2 7L12 12L22 7L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M2 17L12 22L22 17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M2 12L12 17L22 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="ml-2 font-bold text-2xl text-white">TableTales</span>
            </div>
          </Link>

          {currentPage !== "login" && currentPage !== "signup" && (
            <button
              ref={locationButtonRef}
              className="flex items-center text-white hover:text-[#b3d9ff] cursor-pointer transition-colors"
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            >
              <MapPin className="w-4 h-4 mr-1" />
              <span>{searchState.location}</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          )}
          
          {/* Simplified location selector popup */}
          {isLocationDropdownOpen && currentPage !== "login" && currentPage !== "signup" && (
            <div 
              ref={locationDropdownRef}
              className="absolute top-10 left-0 z-50 bg-slate-900 rounded-md shadow-lg overflow-auto w-64 max-h-96"
            >
              <div className="p-2">
                {cities.map((city) => (
                  <div
                    key={city}
                    className="px-4 py-2 text-white hover:bg-slate-800 cursor-pointer rounded"
                    onClick={() => handleLocationSelect(city)}
                  >
                    {city}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-300">Hello, {user?.username}</span>
              <Link href="/profile">
                <button className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-100">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
              </Link>
              {user?.role === 'Customer' && (
                <Link href="/my-bookings">
                  <button className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-100">
                    <Clock className="w-4 h-4 mr-2" />
                    My Bookings
                  </button>
                </Link>
              )}
              <button 
                onClick={logout}
                className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          ) : currentPage !== "login" && currentPage !== "signup" && (
            <div className="flex gap-2">
              <Link href="/login">
                <button className="px-4 py-2 text-slate-100 hover:bg-slate-800 rounded-md">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-4 py-2 bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-md">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search bar section */}
      {currentPage === "" && (
        <div className="border-t border-[#232629] py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <DateSelector
                searchState={searchState}
                setSearchState={setSearchState}
              />

              <div className="w-full sm:w-auto flex-shrink-0 relative z-20">
                <button
                  ref={timeButtonRef}
                  className="w-full sm:w-auto bg-[#fc8019] text-[#232629] border-none px-4 py-2 rounded-xl flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#fc8019] font-bold shadow-md"
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-white" />
                    <span className="text-white font-semibold">{searchState.time || "7:00 PM"}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 text-white" />
                </button>
                {/* Time dropdown */}
                {isTimeDropdownOpen && (
                  <div 
                    ref={timeDropdownRef}
                    className="absolute z-50 mt-1 w-48 bg-white border-2 border-[#fc8019] rounded-xl shadow-2xl max-h-60 overflow-auto"
                  >
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="px-4 py-2 hover:bg-[#fc8019] hover:text-white text-[#232629] font-semibold cursor-pointer rounded-xl"
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* People selector */}
              <div className="w-full sm:w-auto flex-shrink-0 relative z-20">
                <button
                  className="w-full sm:w-auto bg-[#fc8019] text-white border-none px-4 py-2 rounded-xl flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#fc8019] font-bold shadow-md"
                  onClick={() => setIsPeopleDropdownOpen(!isPeopleDropdownOpen)}
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-white" />
                    <span className="text-white font-semibold">
                      {searchState.people} {searchState.people === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 ml-2 text-white" />
                </button>
                {isPeopleDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-48 bg-white border-2 border-[#fc8019] rounded-xl shadow-2xl max-h-60 overflow-auto">
                    {peopleOptions.map((count) => (
                      <div
                        key={count}
                        className="px-4 py-2 hover:bg-[#fc8019] hover:text-white text-[#232629] font-semibold cursor-pointer rounded-xl"
                        onClick={() => handlePeopleSelect(count)}
                      >
                        {count} {count === 1 ? "person" : "people"}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Zip code input */}
              <input
                type="text"
                placeholder="Zip code"
                value={searchState.zip || ''}
                onChange={e => setSearchState(prev => ({ ...prev, zip: e.target.value }))}
                className="w-28 bg-white border-b-2 border-[#fc8019] text-[#232629] px-4 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-[#fc8019] font-semibold"
                maxLength={10}
              />

              {/* Search query input */}
              <input
                type="text"
                placeholder="Location, Restaurant, or Cuisine"
                className="w-full bg-white border-b-2 border-[#fc8019] text-[#232629] px-4 py-2 rounded-none focus:outline-none focus:ring-2 focus:ring-[#fc8019] font-semibold"
                value={searchState.searchQuery || ''}
                onChange={handleSearchQueryChange}
              />

              <button
                className="w-full sm:w-auto bg-[#fc8019] hover:bg-[#ff922b] text-white font-bold px-6 py-2 rounded-full shadow-md transition-colors"
                onClick={() => searchForRestaurants()}
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
