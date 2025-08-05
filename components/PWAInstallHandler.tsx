'use client'

import { useEffect } from 'react'

export default function PWAInstallHandler() {
  useEffect(() => {
    // Register service worker for PWA installability
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
          .then(function(registration) {
            console.log('✅ Service Worker registered successfully:', registration);
          })
          .catch(function(error) {
            console.error('❌ Service Worker registration failed:', error);
          });
      });
    }

    // Handle PWA install prompt
    console.log('🔍 Setting up PWA install listener...');
    
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('🎉 PWA Install prompt available!');
      console.log('Event details:', e);
      
      // Store the event for later use
      (window as any).deferredPrompt = e;
      
      // Create and show install button
      console.log('📱 Creating PWA install button...');
      
      const installButton = document.createElement('button');
      installButton.textContent = '📱 Install App';
      installButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        animation: pulse 2s infinite;
      `;
      
      // Add hover effect
      installButton.onmouseenter = () => {
        installButton.style.transform = 'scale(1.05)';
        installButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
      };
      
      installButton.onmouseleave = () => {
        installButton.style.transform = 'scale(1)';
        installButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
      };
      
      // Add click handler to show prompt (USER GESTURE REQUIRED)
      installButton.onclick = () => {
        if ((window as any).deferredPrompt) {
          console.log('🚀 User clicked install button - triggering Chrome native install prompt...');
          try {
            (window as any).deferredPrompt.prompt();
            (window as any).deferredPrompt.userChoice.then((choiceResult: any) => {
              console.log('✅ User choice:', choiceResult.outcome);
              (window as any).deferredPrompt = null;
              installButton.remove();
            }).catch((error: any) => {
              console.error('❌ Error showing prompt:', error);
            });
          } catch (error) {
            console.error('❌ Error triggering prompt:', error);
            alert('📱 To install this app:\n\n1. Tap the menu (⋮) in your browser\n2. Select "Add to Home Screen"\n3. Follow the prompts to install');
          }
        }
      };
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 4px 25px rgba(102, 126, 234, 0.8); }
          100% { box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(installButton);
      
      // Auto-hide button after 10 seconds if not clicked
      setTimeout(() => {
        if (installButton.parentNode) {
          installButton.style.opacity = '0.7';
          installButton.textContent = '📱 Install (Click me!)';
        }
      }, 10000);
    };

    // Handle PWA installed
    const handleAppInstalled = () => {
      console.log('🎊 PWA was installed successfully!');
      (window as any).deferredPrompt = null;
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if PWA is already installed (multiple detection methods)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    const isPWAInstalled = isStandalone || isFullscreen || isMinimalUI;
    
    // Additional check for iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone === true;
    
    if (isPWAInstalled || (isIOS && isInStandaloneMode)) {
      console.log('📱 PWA is already installed and running in standalone/fullscreen mode');
      console.log('💡 No install button needed - PWA already installed!');
      console.log('🔍 Detection details:', { isStandalone, isFullscreen, isMinimalUI, isIOS, isInStandaloneMode });
      return; // Exit early if PWA is already installed
    }
    
    console.log('🌐 App is running in browser mode - PWA install prompt will show if available');
    console.log('⏳ Waiting for beforeinstallprompt event...');
    
    // Add a fallback button if beforeinstallprompt doesn't fire
    setTimeout(() => {
      // Double-check if PWA is installed before showing fallback button
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
      const isPWAInstalled = isStandalone || isFullscreen || isMinimalUI;
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      
      if (!(window as any).deferredPrompt && !isPWAInstalled && !(isIOS && isInStandaloneMode)) {
        console.log('⚠️ beforeinstallprompt event not fired. Creating fallback install button...');
        
        const fallbackButton = document.createElement('button');
        fallbackButton.textContent = '📱 Install PWA (Manual)';
        fallbackButton.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        `;
        
        fallbackButton.onclick = () => {
          alert('📱 To install this app:\n\n1. Tap the menu (⋮) in your browser\n2. Select "Add to Home Screen"\n3. Follow the prompts to install');
        };
        
        document.body.appendChild(fallbackButton);
      } else {
        console.log('✅ PWA already installed or install prompt available - no fallback button needed');
      }
    }, 3000); // Wait 3 seconds for beforeinstallprompt

    // Debug: Check if PWA is installable
    console.log('🔍 Checking PWA installability...');
    console.log('Manifest:', document.querySelector('link[rel="manifest"]')?.getAttribute('href'));
    console.log('Service Worker:', 'serviceWorker' in navigator);
    
    // Check PWA installability criteria
    setTimeout(() => {
      console.log('🔍 PWA Installability Check:');
      const isHTTPS = window.location.protocol === 'https:';
      const hasManifest = !!document.querySelector('link[rel="manifest"]');
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      console.log('- HTTPS:', isHTTPS);
      console.log('- Manifest:', hasManifest);
      console.log('- Service Worker:', hasServiceWorker);
      console.log('- Display mode:', 'standalone');
      console.log('- Start URL:', '/');
      
      if (!isHTTPS) {
        console.warn('⚠️ PWA requires HTTPS for installability. Use ngrok or deploy to production.');
      }
      
      if (hasManifest && hasServiceWorker && isHTTPS) {
        console.log('✅ PWA is installable!');
      } else {
        console.log('❌ PWA is not installable. Check requirements above.');
      }
    }, 1000);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return null; // This component doesn't render anything
} 