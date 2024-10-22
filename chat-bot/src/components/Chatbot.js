import React, { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa"; // Import Hamburger Icon
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // State for selected level
  const [regionTags, setRegionTags] = useState([]); // State for region tags
  const [levelTags, setLevelTags] = useState([]); // State for level tags
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false); // State for region dropdown menu
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false); // State for level dropdown menu
  const chatboxRef = useRef(null);
  const regionDropdownRef = useRef(null); // Ref for the region dropdown
  const levelDropdownRef = useRef(null); // Ref for the level dropdown

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target)
      ) {
        setIsRegionDropdownOpen(false);
      }
      if (
        levelDropdownRef.current &&
        !levelDropdownRef.current.contains(event.target)
      ) {
        setIsLevelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://mt30md50c7.execute-api.us-east-1.amazonaws.com/dev/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage = { text: data.response, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching reply:", error);
      const errorMessage = {
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegionSelect = (region) => {
    if (region && !regionTags.includes(region)) {
      setRegionTags((prevTags) => [...prevTags, region]);
      setSelectedRegion(region);
      setIsRegionDropdownOpen(false); // Close dropdown after selection
    }
  };

  const handleLevelSelect = (level) => {
    if (level && !levelTags.includes(level)) {
      setLevelTags((prevTags) => [...prevTags, level]); // Add selected level to tags
      setSelectedLevel(level);
      setIsLevelDropdownOpen(false); // Close dropdown after selection
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setRegionTags((prevTags) => prevTags.filter(tag => tag !== tagToRemove));
  };

  const handleLevelTagRemove = (tagToRemove) => {
    setLevelTags((prevTags) => prevTags.filter(tag => tag !== tagToRemove)); // Remove level tag
  };

  const [rating, setRating] = useState(0.8); // State to track rating slider value

  return (
    <div className="chatbot-wrapper">
      <nav className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li>
            <div ref={regionDropdownRef}>
              <span onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)} style={{ cursor: 'pointer' }}>
                Region
              </span>
              {isRegionDropdownOpen && (
                <ul className="dropdown-menu">
                  {["North America (NA)", "Europe", "Latin America", "Middle East and North Africa", "Oceania", "Asia Pacific", "Japan"].map((region) => (
                    <li key={region} onClick={() => handleRegionSelect(region)}>
                      {region}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
          <li>
            <div ref={levelDropdownRef}>
              <span onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)} style={{ cursor: 'pointer' }}>
                Level
              </span>
              {isLevelDropdownOpen && (
                <ul className="dropdown-menu">
                  {["International", "Game Changers", "Challengers"].map((level) => (
                    <li key={level} onClick={() => handleLevelSelect(level)}>
                      {level}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
          <li className="rating-slider">
            <label htmlFor="rating">Minumum VLR Rating: {rating}</label>
            <input
              id="rating"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </li>
        </ul>
      </nav>

      <div className="chatbot-container">
        <div className="chatbot-header">
          <FaBars
            className="hamburger-icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          />
          <h2>ValGPT</h2>
        </div>

        {/* Display selected region tags */}
        <div className="region-tags">
          {regionTags.map((tag, index) => (
            <span key={index} className="region-tag">
              {tag}
              <button onClick={() => handleTagRemove(tag)}>x</button>
            </span>
          ))}
        </div>

        {/* Display selected level tags */}
        <div className="level-tags">
          {levelTags.map((tag, index) => (
            <span key={index} className="level-tag">
              {tag}
              <button onClick={() => handleLevelTagRemove(tag)}>x</button>
            </span>
          ))}
        </div>

        <div className="chatbox" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            aria-label="Chat input"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
