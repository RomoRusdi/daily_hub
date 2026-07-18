import './loading-scene.css'

/**
 * Full-screen loading state: animated camping scene (day/night cycle) from
 * Uiverse.io by Admin12121, with the app name underneath. Markup mirrors the
 * selectors in loading-scene.css.
 */
export default function LoadingScene() {
  return (
    <div className="loading-screen">
      <div className="scene" role="status" aria-label="Memuat DailyHub">
        <div className="forest">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={`tree tree${i}`}>
              <div className="branch branch-top" />
              <div className="branch branch-middle" />
              <div className="branch branch-bottom" />
            </div>
          ))}
        </div>

        <div className="tent">
          <div className="roof" />
          <div className="roof-border-left">
            <span className="roof-border roof-border1" />
            <span className="roof-border roof-border2" />
            <span className="roof-border roof-border3" />
          </div>
          <div className="door left-door">
            <span className="left-door-inner" />
          </div>
          <div className="door right-door">
            <span className="right-door-inner" />
          </div>
        </div>

        <div className="floor">
          <span className="ground ground1" />
          <span className="ground ground2" />
        </div>

        <div className="fireplace">
          <span className="support" />
          <span className="support" />
          <span className="bar" />
          <span className="hanger" />
          <span className="smoke" />
          <span className="pan" />
          <div className="fire">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`line line${i}`}>
                <div className="particle particle1" />
                <div className="particle particle2" />
                <div className="particle particle3" />
                <div className="particle particle4" />
              </div>
            ))}
          </div>
        </div>

        <div className="time-wrapper">
          <div className="time">
            <span className="day" />
            <div className="night">
              <span className="star star1" />
              <span className="star star2" />
              <span className="star star-big star3" />
              <span className="star star4" />
              <span className="star star5" />
              <span className="star star-big star6" />
              <span className="star star7" />
              <span className="moon" />
            </div>
          </div>
        </div>
      </div>

      <p className="loading-title">DailyHub</p>
    </div>
  )
}
