 // Core variables
    var getMinute = document.getElementById("minute");
    var getSecond = document.getElementById("second");
    var getMilliSecond = document.getElementById("milliSecond");
    var startBtn = document.getElementById("startBtn");
    var lapBtn = document.getElementById("lapBtn");
    var container = document.getElementById('container');
    var lapTimesContainer = document.getElementById('lapTimes');
    var achievementEl = document.getElementById('achievement');
    var achievementText = document.getElementById('achievementText');

    var minute = 0;
    var second = 0;
    var milliSecond = 0;
    var interval;
    var lapCount = 0;
    var lapTimes = [];
    var soundEnabled = true;
    var totalCentiseconds = 0;

    // Initialize particles
    function createParticles() {
      const particles = document.querySelector('.particles');
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = Math.random() * 6 + 4 + 's';
        particles.appendChild(particle);
      }
    }

    // Sound effects
    function playSound(type) {
      if (!soundEnabled) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch(type) {
        case 'start':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
          break;
        case 'stop':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
          break;
        case 'reset':
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
          break;
        case 'lap':
          oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      const soundIcon = document.getElementById('soundIcon');
      const soundToggle = document.querySelector('.sound-toggle');
      
      if (soundEnabled) {
        soundIcon.className = 'fas fa-volume-up';
        soundToggle.classList.remove('muted');
      } else {
        soundIcon.className = 'fas fa-volume-mute';
        soundToggle.classList.add('muted');
      }
    }

    function showAchievement(text) {
      achievementText.textContent = text;
      achievementEl.classList.add('show');
      setTimeout(() => {
        achievementEl.classList.remove('show');
      }, 3000);
    }

    function checkAchievements() {
      if (totalCentiseconds === 6000) { // 1 minute
        showAchievement('First Minute Completed! 🎉');
      } else if (totalCentiseconds === 18000) { // 3 minutes
        showAchievement('Endurance Champion! 💪');
      } else if (lapCount === 5) {
        showAchievement('Lap Master! 🏁');
      } else if (totalCentiseconds === 360000) { // 1 hour
        showAchievement('Time Lord! ⏰');
      }
    }

    function start() {
      interval = setInterval(function () {
        getMilliSecond.textContent = milliSecond.toString().padStart(2, '0');
        
        if (milliSecond == 100) {
          getSecond.textContent = second.toString().padStart(2, '0');
          second++;
          milliSecond = 0;
          
          if (second == 61) {
            minute++;
            getMinute.textContent = minute.toString().padStart(2, '0');
            second = 0;
          }
        }

        milliSecond++;
        totalCentiseconds++;
        checkAchievements();
      }, 10);
      
      startBtn.disabled = true;
      lapBtn.disabled = false;
      container.classList.add('running');
      playSound('start');
      
      // Update button text and icon
      startBtn.innerHTML = '<i class="fas fa-play"></i>Running...';
    }

    function stop() {
      clearInterval(interval);
      startBtn.disabled = false;
      lapBtn.disabled = true;
      container.classList.remove('running');
      playSound('stop');
      
      // Reset button text and icon
      startBtn.innerHTML = '<i class="fas fa-play"></i>Start';
    }

    function reset() {
      clearInterval(interval);
      container.classList.remove('running');
      
      // Reset time values
      getMinute.textContent = "00";
      getSecond.textContent = "00";
      getMilliSecond.textContent = "00";
      minute = 0;
      second = 0;
      milliSecond = 0;
      totalCentiseconds = 0;
      
      // Reset UI
      startBtn.disabled = false;
      lapBtn.disabled = true;
      startBtn.innerHTML = '<i class="fas fa-play"></i>Start';
      
      // Clear lap times
      lapCount = 0;
      lapTimes = [];
      lapTimesContainer.innerHTML = '';
      
      playSound('reset');
    }

    function lap() {
      if (interval) {
        lapCount++;
        const currentTime = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${milliSecond.toString().padStart(2, '0')}`;
        lapTimes.push({
          number: lapCount,
          time: currentTime,
          totalCentiseconds: totalCentiseconds
        });
        
        updateLapDisplay();
        playSound('lap');
      }
    }

    function updateLapDisplay() {
      if (lapTimes.length === 0) {
        lapTimesContainer.innerHTML = '';
        return;
      }

      let html = '<h3><i class="fas fa-stopwatch"></i> Lap Times</h3>';
      
      // Show laps in reverse order (most recent first)
      for (let i = lapTimes.length - 1; i >= 0; i--) {
        const lap = lapTimes[i];
        let lapDiff = '';
        
        if (i > 0) {
          const prevLap = lapTimes[i - 1];
          const diff = lap.totalCentiseconds - prevLap.totalCentiseconds;
          const diffMin = Math.floor(diff / 6000);
          const diffSec = Math.floor((diff % 6000) / 100);
          const diffCenti = diff % 100;
          lapDiff = ` (+${diffMin.toString().padStart(2, '0')}:${diffSec.toString().padStart(2, '0')}:${diffCenti.toString().padStart(2, '0')})`;
        }
        
        html += `
          <div class="lap-item">
            <span class="lap-number">Lap ${lap.number}</span>
            <span class="lap-time">${lap.time}${lapDiff}</span>
          </div>
        `;
      }
      
      lapTimesContainer.innerHTML = html;
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
      switch(event.code) {
        case 'Space':
          event.preventDefault();
          if (!startBtn.disabled) {
            start();
          } else {
            stop();
          }
          break;
        case 'KeyR':
          if (event.ctrlKey) {
            event.preventDefault();
            reset();
          }
          break;
        case 'KeyL':
          if (!lapBtn.disabled) {
            lap();
          }
          break;
        case 'KeyM':
          toggleSound();
          break;
      }
    });

    // Initialize
    createParticles();

    // Add tooltips for keyboard shortcuts
    startBtn.title = 'Start/Stop (Spacebar)';
    document.querySelector('.btn-reset').title = 'Reset (Ctrl+R)';
    lapBtn.title = 'Lap Time (L)';
    document.querySelector('.sound-toggle').title = 'Toggle Sound (M)';