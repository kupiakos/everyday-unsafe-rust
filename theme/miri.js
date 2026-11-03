// Adds two buttons next to "Run" on Everyday Unsafe playgrounds:
// - Miri, using Tree Borrows, via https://play.rust-lang.org/miri. Also shown
//   on `no_run` blocks.
// - Run with optimizations (release mode), via https://play.rust-lang.org/execute.
(function () {
  if (!window.location.pathname.includes("/everyday-unsafe/")) {
    return;
  }

  function fetchWithTimeout(url, options, timeout) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeout),
      ),
    ]);
  }

  // Matches the request book.js builds for "Run".
  function baseParams(preBlock) {
    const classes = preBlock.querySelector("code").classList;
    let code = playground_text(preBlock);
    if (!classes.contains("warnunused")) {
      code = "#![allow(unused)] " + code;
    }
    let edition = "2015";
    for (const e of ["2018", "2021", "2024"]) {
      if (classes.contains("edition" + e)) {
        edition = e;
      }
    }
    const tests = !code.includes("fn main") && code.includes("#[test]");
    // mdbook doesn't wrap editable blocks in `fn main`, so library-style
    // exercises would fail with E0601. Give them an empty one.
    if (!code.includes("fn main") && !tests) {
      code += "\nfn main() {}\n";
    }
    return { code, edition, tests };
  }

  function resultBlocks(preBlock) {
    let stderr = preBlock.querySelector(".result.stderr");
    if (!stderr) {
      stderr = document.createElement("code");
      stderr.className = "result stderr hljs nohighlight hidden";
      preBlock.append(stderr);
    }
    let stdout = preBlock.querySelector(".result.stdout");
    if (!stdout) {
      stdout = document.createElement("code");
      stdout.className = "result stdout hljs nohighlight";
      preBlock.append(stdout);
    }
    return { stdout, stderr };
  }

  function run(preBlock, endpoint, params, label) {
    const { stdout, stderr } = resultBlocks(preBlock);
    stdout.innerText = label + "...";
    stdout.classList.remove("result-no-output");
    stderr.innerText = "";
    stderr.classList.add("hidden");

    fetchWithTimeout(
      "https://play.rust-lang.org/" + endpoint,
      {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        mode: "cors",
        body: JSON.stringify(params),
      },
      60000,
    )
      .then((response) => response.json())
      .then((response) => {
        if (response.error) {
          stdout.innerText = response.error;
          return;
        }
        if (response.stdout.trim() === "") {
          stdout.innerText = "No output";
          stdout.classList.add("result-no-output");
        } else {
          stdout.innerText = response.stdout;
        }
        // Trim the Compiling/Finished/Running lines, as book.js does.
        let out = response.stderr.replace(
          /^\s+Compiling(.+)\s+Finished(.+)\s+Running(.+)\n/,
          "",
        );
        if (
          out.includes("error: memory leaked") &&
          !out.includes("Undefined Behavior")
        ) {
          out = "Remember: Leaking is not UB. Sound code can leak.\n\n" + out;
        }
        if (out.includes("can't call foreign function")) {
          out = "Miri can't run C code, so it can't check this call.\n\n" + out;
        }
        if (
          out.includes("could not compile") &&
          preBlock.querySelector("code").classList.contains("compile_fail")
        ) {
          out = "As intended, this example doesn't compile.\n\n" + out;
        }
        if (out.trim() !== "") {
          stderr.classList.remove("hidden");
          stderr.innerText = out;
        }
      })
      .catch((error) => {
        stdout.innerText = "Playground Communication: " + error.message;
      });
  }

  function miri(preBlock) {
    const params = baseParams(preBlock);
    params.aliasingModel = "tree";
    run(preBlock, "miri", params, "Running Miri (Tree Borrows)");
  }

  function runRelease(preBlock) {
    const params = baseParams(preBlock);
    Object.assign(params, {
      backtrace: true,
      channel: params.code.includes("#![feature") ? "nightly" : "stable",
      mode: "release",
      crateType: "bin",
    });
    run(preBlock, "execute", params, "Running with optimizations");
  }

  function makeButton(className, title, icon, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.title = title;
    button.setAttribute("aria-label", title);
    const template = document.getElementById(icon);
    button.innerHTML = template ? template.innerHTML : title;
    button.addEventListener("click", onClick);
    return button;
  }

  for (const preBlock of document.querySelectorAll(".playground")) {
    const playButton = preBlock.querySelector(".play-button");
    if (!playButton) {
      continue;
    }
    const code = preBlock.querySelector("code");
    const miriButton = makeButton(
      "miri-button",
      "Run with Miri (Tree Borrows)",
      "fa-bug",
      () => miri(preBlock),
    );
    const releaseButton = makeButton(
      "release-button",
      "Run with optimizations",
      "fa-gauge-high",
      () => runRelease(preBlock),
    );
    playButton.after(miriButton, releaseButton);

    // Follow book.js's "Run" visibility (it waits for the crate list), except
    // that Miri stays on `no_run` blocks: those are mostly UB demos, which
    // Miri runs safely.
    const noRun = code.classList.contains("no_run");
    const sync = () => {
      const shown =
        !playButton.hidden && !playButton.classList.contains("hidden");
      miriButton.hidden = !(shown || noRun);
      releaseButton.hidden = !shown;
    };
    sync();
    new MutationObserver(sync).observe(playButton, {
      attributes: true,
      attributeFilter: ["class", "hidden"],
    });

    if (window.ace && code.classList.contains("editable")) {
      window.ace.edit(code).commands.addCommand({
        name: "miri",
        bindKey: { win: "Ctrl-Shift-Enter", mac: "Ctrl-Shift-Enter" },
        exec: () => miri(preBlock),
      });
    }
  }
})();
