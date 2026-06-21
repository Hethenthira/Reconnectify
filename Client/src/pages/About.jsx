import React from "react";

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="container-fluid p-0 position-relative">
        <img
          src="src/assets/aboutimage.jpg"
          alt="National Art School"
          className="img-fluid w-100  vh-100  object-fit-cover"
        />
          <div
    className="position-absolute top-0 start-0 w-100 h-100"
    style={{
      backgroundColor: "rgba(0, 0, 0, 0.20)"
    }}
  ></div>

        {/* Bottom Right Text */}
        <div className="position-absolute bottom-0 end-0 p-5 my-5 text-white text-end">
          <h1 className="fw-bold display-4 ">
            <span className="me-3">—</span>Alumni success stories
          </h1>
        </div>
      </div>


      {/* About Us Section */}
      <div className="container-fluid bg-light py-5">
        <div className="container">
          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-dark me-3"
              style={{ width: "60px", height: "4px" }}
            ></div>
            <h2 className="fw-bold m-0">About Us</h2>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <p className="text-muted">
                With origins that can be traced back to 1873, the National Art
                School is a leading Australian visual arts institution with a
                rich tradition of artistic practice and generations of
                world-renowned alumni.
              </p>
              <p className="text-muted">
                NAS offers a select number of full-time programs; a Bachelor of
                Fine Art and Master of Fine Art, and for the community, a
                comprehensive range of part-time and intensive short courses.
              </p>
            </div>

            <div className="col-md-6">
              <p className="text-muted">
                It is through this model that we continue to produce
                award-winning, distinguished graduates. Since 1922 we have
                occupied the old Darlinghurst gaol, an unrivalled sandstone
                campus.
              </p>
              <p className="text-muted">
                The campus houses artist studios, workshops, the NAS Gallery, a
                specialist fine art library and the famed Cell Block Theatre.
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* card first section */}
        <div className="container mt-5 mb-5">
          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-md-4">
              <div className="bg-light h-100">
                <img
                  src="src/assets/dreamy-graduate-woman-smiling-thinking-sitting-with-books.jpg"
                  alt="Current Students"
                  className="img-fluid w-100"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h5 className="fw-bold">Current Students</h5>
                  <p className="text-muted">
                    Information for enrolled students about resources and support
                    services.
                  </p>
                  <span className="fw-bold text-uppercase">More</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-md-4">
              <div className="bg-light h-100">
                <img
                  src="src/assets/2944808_28468.jpg"
                  alt="Alumni"
                  className="img-fluid w-100"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h5 className="fw-bold">Alumni</h5>
                  <p className="text-muted">
                    Alumni who have contributed to the history of Australian art and
                    continue to influence contemporary practice.
                  </p>
                  <span className="fw-bold text-uppercase">More</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-md-4">
              <div className="bg-light h-100">
                <img
                  src="src\assets\College Board Launches First-Ever AP Program In African American Studies.jpg"
                  alt="Staff"
                  className="img-fluid w-100"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h5 className="fw-bold">Staff</h5>
                  <p className="text-muted">
                    We are committed to creating an environment of artistic and
                    educational excellence.
                  </p>
                  <span className="fw-bold text-uppercase">More</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      <div>
         <div className="container my-5">
      <div className="row g-3">

        {/* Left column */}
        <div className="col-md-4">
          <div
            className="position-relative mb-3 rounded overflow-hidden"
            style={{
              height: "220px",
              backgroundImage: "url(src/assets/aboutStyle.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 start-0 p-3 text-white fw-semibold">
              Bachelor of Fine Art
            </div>
          </div>

          <div
            className="position-relative rounded overflow-hidden"
            style={{
              height: "220px",
              backgroundImage: "url(src/assets/pic.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 start-0 p-3 text-white fw-semibold">
              Doctor of Fine Art
            </div>
          </div>
        </div>

        {/* Center big image */}
        <div className="col-md-4">
          <div
            className="rounded overflow-hidden h-100"
            style={{
              minHeight: "460px",
              backgroundImage: "url(src/assets/aboutStyle1.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        </div>

        {/* Right column */}
        <div className="col-md-4">
          <div
            className="position-relative mb-3 rounded overflow-hidden"
            style={{
              height: "220px",
              backgroundImage: "url(src/assets/stanger.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 end-0 p-3 text-white fw-semibold text-end">
              Master of Fine Art
            </div>
          </div>

          <div
            className="position-relative rounded overflow-hidden"
            style={{
              height: "220px",
              backgroundImage: "url(src/assets/download.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="position-absolute bottom-0 end-0 p-3 text-white fw-semibold text-end">
              Core Subjects
            </div>
          </div>
        </div>

      </div>
    </div>

        {/* People Section */}
        <div className="container-fluid bg-light py-5">
          <div className="container mt-5">
            {/* Heading */}
            <div className="d-flex align-items-center mb-4">
              <div
                className="bg-dark me-3"
                style={{ width: "60px", height: "4px" }}
              ></div>
              <h2 className="fw-bold m-0">People</h2>
            </div>

            {/* Text Content */}
            <div className="row mb-5">
              <div className="col-md-6">
                <p className="text-muted">
                  The National Art School exists today because people were
                  passionate about it. They believed in the need for it, believed
                  in its philosophy, and believed in the people who composed it.
                </p>
                <p className="text-muted">
                  Academics, students, staff, alumni and supporters all ensure NAS
                  remains an important part of the Australian and international
                  arts community.
                </p>
              </div>

              <div className="col-md-6">
                <p className="text-muted">
                  Many of our academics were once students here, learning within
                  our studio-based model of teaching that they now lead.
                </p>
                <p className="text-muted">
                  Through NAS they became practicing visual artists and now guide
                  the next wave of artists.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section with Background Image */}
        <div
          className="container-fluid py-5"
          style={{
            backgroundImage: "url(src/assets/people-bg.jpg)", // replace image
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* card 2 section */}
          <div className="container " >
            <div className="row g-4">
              {/* Card 1 */}
              <div className="col-md-4">
                <div className="bg-light h-100">
                  <img
                    src="src\assets\good.jpg"
                    alt="Current Students"
                    className="img-fluid w-100"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h5 className="fw-bold">Current Students</h5>
                    <p className="text-muted">
                      Information for enrolled students about resources and support
                      services.
                    </p>
                    <span className="fw-bold text-uppercase">More</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-md-4">
                <div className="bg-light h-100">
                  <img
                    src="src\assets\nice.jpg"
                    alt="Alumni"
                    className="img-fluid w-100"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h5 className="fw-bold">Alumni</h5>
                    <p className="text-muted">
                      Alumni who have contributed to the history of Australian art and
                      continue to influence contemporary practice.
                    </p>
                    <span className="fw-bold text-uppercase">More</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-md-4">
                <div className="bg-light h-100">
                  <img
                    src="src/assets/College Board Launches First-Ever AP Program In African American Studies.jpg"
                    alt="Staff"
                    className="img-fluid w-100"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h5 className="fw-bold">Staff</h5>
                    <p className="text-muted">
                      We are committed to creating an environment of artistic and
                      educational excellence.
                    </p>
                    <span className="fw-bold text-uppercase">More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
};

export default About;


   

