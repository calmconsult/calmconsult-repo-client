$(document).ready(function () {
  //   $(window).on("scroll", function () {
  //     if ($(window).scrollTop() > 50) {
  //       $("#main-navbar").addClass("show");
  //     } else {
  //       $("#main-navbar").removeClass("show");
  //     }
  //   });

  // scroll to top
  // ====================
  if ($("#scroll-to-top").length) {
    var scrollTrigger = 100, // px
      backToTop = function () {
        const scrollTop = $(window).scrollTop();
        if (scrollTop > scrollTrigger) {
          $("#scroll-to-top").addClass("down-up");
        } else {
          $("#scroll-to-top").removeClass("down-up");
        }
      };
    backToTop();
    $(window).on("scroll", function () {
      backToTop();
    });
    $("#scroll-to-top").on("click", function (e) {
      e.preventDefault();
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        700
      );
    });
  }

  // Scroll slowly the dropdown menu
  // ================================================================
  $(".dropdown").on("show.bs.dropdown", function () {
    $(this).find(".dropdown-menu").first().stop().slideDown();
  });

  $(".dropdown").on("hide.bs.dropdown", function () {
    $(this).find(".dropdown-menu").first().stop().slideUp();
  });

  const documentLoader1 = document.querySelector(".doc1");
  if (documentLoader1) {
    documentLoader1.addEventListener("change", function (e) {
      let fileName = document.getElementById("uploadContent").files[0].name;
      let nextSibling = e.target.nextElementSibling;
      nextSibling.innerText = fileName;
    });
  }

  const deleteDocument = document.getElementById("delete-document");
  const deletecontainer = document.getElementById("delete-overlay");
  const noDelete = document.getElementById("no-delete");
  if (deleteDocument) {
    deleteDocument.addEventListener("click", (e) => {
      e.preventDefault();
      deletecontainer.style.display = "block";
    });
  }
  if (noDelete) {
    noDelete.addEventListener("click", () => {
      deletecontainer.style.display = "none";
    });
  }
});
