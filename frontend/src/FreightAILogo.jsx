import React from 'react';
import logo from './assests/freightai-logo-transparent.png';

export default function FreightAILogo({ className = '' }) {
  return <img className={`freightai-logo ${className}`.trim()} src={logo} alt="FreightAI — Predict. Optimize. Charter Smarter." />;
}
