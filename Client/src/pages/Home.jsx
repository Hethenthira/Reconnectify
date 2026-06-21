
// Mock background image
const homeBg = "src/assets/homeBackground.jpg";

const Home = () => {
  return (
    <>
      <section
        className="position-relative vh-100 d-flex align-items-center overflow-hidden"
        style={{
          backgroundImage: `url(${homeBg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}
      >
        {/* Dark Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)"
          }}
        ></div>

        {/* Content */}
        <div className="container position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-6 text-white">
              <h1 className="display-3 fw-bold mb-4 animate-fade-in" style={{ fontSize: '4rem', letterSpacing: '-2px', textShadow: '2px 4px 8px rgba(0,0,0,0.3)' }}>
                Reunite & Connect.
              </h1>

              <p className="lead mb-5 fw-semibold text-white" style={{ fontSize: '1.3rem', lineHeight: '1.8', textShadow: '1px 2px 4px rgba(0,0,0,0.3)' }}>
                Join thousands of alumni reconnecting with their alma mater.
                Share career updates, discover opportunities, and participate
                in exclusive events.
              </p>

              <div className="d-flex gap-3">
                <a
                  href="/about"
                  className="btn btn-light btn-lg px-5 py-3 fw-bold rounded-pill text-dark text-decoration-none shadow-lg hover-scale"
                  style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}
                >
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" style={{ marginTop: '80px', marginBottom: '80px' }}>
        <div className="row align-items-center">
          <div className="col-lg-5">
            <small className="text-uppercase fw-bold text-primary bg-primary bg-opacity-10 px-4 py-2 rounded-pill" style={{ fontSize: '12px', letterSpacing: '2px' }}>About</small>
            <h2 className="fw-bold mt-4 mb-4" style={{ fontSize: '3rem', letterSpacing: '-1px', color: '#2c3e50', lineHeight: '1.2' }}>
              Build Skills From<br />Expert Teacher
            </h2>
            <p className="text-muted mt-4 mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.9' }}>
              Learn from industry experts and experienced educators who
              are dedicated to helping you achieve your goals.
            </p>
            <a href="/about" className="btn btn-dark btn-lg px-5 py-3 rounded-pill shadow-lg hover-scale" style={{ fontWeight: '600', letterSpacing: '0.5px' }}>
              Read More
            </a>
          </div>
        </div>
      </section>

      {/* COURSE & STUDY PROGRAM */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container text-center" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <h3 className="fw-bold mb-5" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px', color: '#2c3e50' }}>Course And Study Program</h3>

          <div className="row g-4 justify-content-center">
            {[
              { title: "Public Course", icon: "bi-people" },
              { title: "Undergraduate Courses", icon: "bi-mortarboard" },
              { title: "Master's Courses", icon: "bi-book" },
              { title: "Postgraduate Research", icon: "bi-search" },
              { title: "Become Lecturer", icon: "bi-person-workspace" }
            ].map((item, index) => (
              <div className="col-md-2 col-6" key={index}>
                <div
                  className="border-0 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 bg-white shadow-lg hover-lift"
                  style={{ 
                    width: "80px", 
                    height: "80px",
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={`bi ${item.icon} fs-3 text-white`}></i>
                </div>
                <p className="fw-bold mb-0" style={{ fontSize: '14px', color: '#2c3e50' }}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSE CARDS */}
      <section
  className="container py-5"
  style={{ marginTop: "80px", marginBottom: "80px" }}
>
  <div className="row g-5">
    {[
      {
        title: "Undergraduate Courses",
        image: "src/assets/young-people-studying-using-laptop.jpg",
      },
      {
        title: "Master's Courses",
        image: "src/assets/close-up-people-graduating.jpg",
      },
      {
        title: "Become Lecturer",
        image: "src/assets/confident-man.jpg",
      },
    ].map((item, index) => (
      <div className="col-md-4" key={index}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden hover-lift h-100">
          
          {/* Image Section */}
          <div style={{ height: "250px", overflow: "hidden" }}>
            <img
              src={item.image}
              alt={item.title}
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Content */}
          <div className="card-body p-4 text-center">
            <h6
              className="fw-bold mb-0"
              style={{ fontSize: "1.3rem", color: "#2c3e50" }}
            >
              {item.title}
            </h6>
          </div>

        </div>
      </div>
    ))}
  </div>
</section>

      {/* VISION SECTION */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-4">
              <div className="position-relative">
                <img
                  src="src/assets/9398790_34816.jpg"
                  className="img-fluid rounded-4 shadow-lg"
                  alt="Rector"
                  style={{ border: '8px solid white' }}
                />
                <div className="position-absolute bottom-0 start-0 w-100 text-center bg-white bg-opacity-95 py-3 rounded-bottom-4">
                  <p className="fw-bold mb-0 text-primary" style={{ fontSize: '1.1rem', letterSpacing: '0.5px' }}>RECTOR UNIONE</p>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <h4 className="fw-bold mb-4" style={{ fontSize: '2.5rem', letterSpacing: '-0.5px', color: '#2c3e50' }}>Our Vision For Unione</h4>
              <p className="text-muted mb-5" style={{ fontSize: '1.1rem', lineHeight: '1.9' }}>
                Our vision is to build a strong educational ecosystem
                where learners and educators grow together.
              </p>

              <div className="row text-center mt-4 g-4">
                {[
                  { value: "4,500+", label: "Students" },
                  { value: "320+", label: "Events Success" },
                  { value: "105+", label: "Professional Teacher" },
                  { value: "720+", label: "Course Success" }
                ].map((item, index) => (
                  <div className="col-md-3 col-6" key={index}>
                    <div className="py-4 rounded-4 shadow-lg hover-lift" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', transition: 'all 0.3s ease' }}>
                      <h5 className="fw-bold mb-2 text-white" style={{ fontSize: '2rem' }}>{item.value}</h5>
                      <small className="text-white fw-semibold" style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
    <section
  className="container py-5 text-center"
  style={{ marginTop: "80px", marginBottom: "80px" }}
>
  <h4
    className="fw-bold mb-5"
    style={{
      fontSize: "2.5rem",
      letterSpacing: "-0.5px",
      color: "#2c3e50",
    }}
  >
    Our Vision For Unione
  </h4>

  <div className="row g-5">
    {[
      {
        name: "Jack Tergarden",
        role: "Teaching Assistant",
        image: "src/assets/young-male-student-with-diploma-posing-white.jpg",
      },
      {
        name: "Jenna Hartogeh",
        role: "Web Developer",
        image: "src/assets/happy-graduate-student-gown-posing-white-background.jpg",
      },
      {
        name: "Ted Carter",
        role: "React Developer",
        image: "src/assets/smiling-young-superhero-guy-wearing-tie-holding-clipboard-showing-thumb-up-isolated-white.jpg",
      },
      {
        name: "Sarah Wilson",
        role: "UI/UX Designer",
        image: "src/assets/pleased-young-caucasian-superhero-man-optical-glasses-wearing-suit-with-red-cloak-graduation-cap-holds-diploma-isolated-white-background-with-copy-space.jpg",
      },
    ].map((person, index) => (
      <div className="col-md-3 col-sm-6" key={index}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden hover-lift h-100">
          <div className="position-relative">
            <img
              src={person.image}
              alt={person.name}
              className="w-100"
              style={{ height: "300px", objectFit: "cover" }}
            />

            <div
              className="position-absolute bottom-0 start-0 w-100 text-white text-center py-4"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}
            >
              <h6 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
                {person.name}
              </h6>
              <small
                className="fw-semibold"
                style={{ fontSize: "13px", letterSpacing: "0.5px" }}
              >
                {person.role}
              </small>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .btn {
          transition: all 0.3s ease;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        }
        
        /* Bootstrap Icons CDN */
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
      `}</style>
    </>
  );
};

export default Home;