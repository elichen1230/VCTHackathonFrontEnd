import React, { useState, useRef, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [regionTags, setRegionTags] = useState([]);
  const [levelTags, setLevelTags] = useState([]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [rating, setRating] = useState(0.8);

  const chatboxRef = useRef(null);
  const regionDropdownRef = useRef(null);
  const levelDropdownRef = useRef(null);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

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

    // Log the prompt and other parameters being sent to the backend
    const payload = {
      prompt: input,
      regions: regionTags, // Send all selected regions
      levels: levelTags, // Send all selected levels
      rating: parseFloat(rating),
    };

    console.log("Sending to backend:", payload); // Log the payload

    try {
      const response = await fetch(
        "https://mt30md50c7.execute-api.us-east-1.amazonaws.com/dev/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload), // Use the logged payload
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
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
      setIsRegionDropdownOpen(false);
    }
  };

  const handleLevelSelect = (level) => {
    if (level && !levelTags.includes(level)) {
      setLevelTags((prevTags) => [...prevTags, level]);
      setSelectedLevel(level);
      setIsLevelDropdownOpen(false);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setRegionTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  const handleLevelTagRemove = (tagToRemove) => {
    setLevelTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="chatbot-wrapper">
      <nav className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li className="filter-section">
            <div ref={regionDropdownRef}>
              <span
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                Region
              </span>
              {isRegionDropdownOpen && (
                <ul className="dropdown-menu">
                  {["na", "eu", "sa", "mn", "oce", "ap", "jp"].map((region) => (
                    <li key={region} onClick={() => handleRegionSelect(region)}>
                      {region}
                    </li>
                  ))}
                </ul>
              )}
              <div className="filter-tags">
                {regionTags.map((tag, index) => (
                  <span key={index} className="filter-tag region-tag">
                    {tag}
                    <button onClick={() => handleTagRemove(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </li>

          <li className="filter-section">
            <div ref={levelDropdownRef}>
              <span
                onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                Level
              </span>
              {isLevelDropdownOpen && (
                <ul className="dropdown-menu">
                  {["international", "game changers", "challengers"].map(
                    (level) => (
                      <li key={level} onClick={() => handleLevelSelect(level)}>
                        {level}
                      </li>
                    )
                  )}
                </ul>
              )}
              <div className="filter-tags">
                {levelTags.map((tag, index) => (
                  <span key={index} className="filter-tag level-tag">
                    {tag}
                    <button onClick={() => handleLevelTagRemove(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </li>

          <li className="rating-slider">
            <label htmlFor="rating">Minimum VLR Rating: {rating}</label>
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
