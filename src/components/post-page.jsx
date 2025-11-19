import React from "react";
import "./styles/post-page.css";

export default function PostPage() {
  return (
    <div className="post-page">
      <main className="post-wrapper">
        <h1 className="post-heading">What would you like to post?</h1>
        <p className="post-subline">Choose whether you want to offer a freelance service or post a project that needs freelancers.</p>
        
        <div className="post-options">
          <a href="#/post-service" className="post-option">
            <div className="post-option-title">Post Freelance Service</div>
            <div className="post-option-text">Offer your skills and services to clients</div>
          </a>
          
          <a href="#/post-project" className="post-option">
            <div className="post-option-title">Post Project</div>
            <div className="post-option-text">Post a project and find freelancers to work on it</div>
          </a>
        </div>
      </main>
    </div>
  );
}


