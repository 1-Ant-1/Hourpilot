
const pageContent = document.getElementById("page-content");
const pageTitle = document.getElementById("page-title");
const todayDate = document.getElementById("today-date");

const pageNames = {
    home: "Good day.",
    planner: "Plan your day.",
    tasks: "Your tasks.",
    analytics: "Your progress.",
    settings: "Settings."
};

function getDateString(date = new Date()) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function getPlans() {
    try {
        return JSON.parse(
            localStorage.getItem("hourpilot-plans") || "{}"
        );
    } catch (error) {
        return {};
    }
}

function savePlans(plans) {
    localStorage.setItem("hourpilot-plans", JSON.stringify(plans));
}

function showPage(page) {
    document.body.classList.toggle("home-page-active", page === "home");

    document.querySelectorAll(".nav-item").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    pageTitle.textContent = pageNames[page] || "HourPilot";

    if (page === "home") {
        renderHome();
    } else if (page === "planner") {
        renderPlanner();
    } else if (page === "tasks") {
        renderTasks();
    } else if (page === "analytics") {
        renderAnalytics();
    } else if (page === "settings") {
        renderSettings();
    }
}

document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

document.addEventListener("click", event => {
    const button = event.target.closest("[data-go]");
    if (button) showPage(button.dataset.go);
});

function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

function renderHome() {
    const todayString = getDateString();
    const plans = getPlans();
    const todayPlan = plans[todayString];
    const todayTasks = todayPlan?.tasks || [];

    const completed = todayTasks.filter(task => task.completed).length;
    const total = todayTasks.length;
    const productivity = total
        ? Math.round((completed / total) * 100)
        : 0;

    const upcomingDate = Object.keys(plans)
        .filter(date => date > todayString)
        .sort()[0];

    const upcomingPlan = upcomingDate ? plans[upcomingDate] : null;
    const upcomingTasks = upcomingPlan?.tasks || [];

    pageContent.innerHTML = `
        <div class="welcome">
            <p class="eyebrow">YOUR DAY, YOUR PACE</p>
            <h2>Make today count.</h2>
            <p>A clearer plan. One hour at a time.</p>
            <button class="primary-btn" data-go="planner">
                Plan your day →
            </button>
        </div>

        <div class="section-heading">
            <div>
                <p class="eyebrow">OVERVIEW</p>
                <h2>Today's progress</h2>
            </div>
            <span class="muted">A little progress adds up.</span>
        </div>

        <div class="stats-grid">
            <article class="stat-card">
                <p>Tasks completed</p>
                <h3>${completed} <small>tasks</small></h3>
                <span>Keep moving forward</span>
            </article>

            <article class="stat-card">
                <p>Daily productivity</p>
                <h3>${productivity}<small>%</small></h3>
                <span>Based on today's tasks</span>
            </article>

            <article class="stat-card">
                <p>Today's schedule</p>
                <h3>${total} <small>tasks</small></h3>
                <span>One step at a time</span>
            </article>
        </div>

        <div class="section-heading schedule-heading">
            <div>
                <p class="eyebrow">COMING UP</p>
                <h2>Your timetable</h2>
            </div>
            <button class="text-btn" data-go="tasks">View all →</button>
        </div>

        <div class="schedule-card">
            ${
                total
                    ? todayTasks.map(task => `
                        <div class="hour-row">
                            <span class="task-status ${task.completed ? "is-complete" : ""}">
                                ${task.completed ? "✓" : "○"}
                            </span>
                            <span>${escapeHtml(task.name)}</span>
                        </div>
                    `).join("")
                    : `
                        <div class="empty-state">
                            <span class="empty-icon">◷</span>
                            <h3>No plan for today yet.</h3>
                            <p>Your upcoming plan is shown below.</p>
                            <button class="secondary-btn" data-go="planner">
                                Plan today
                            </button>
                        </div>
                    `
            }
        </div>

        <div class="section-heading schedule-heading">
            <div>
                <p class="eyebrow">PLAN AHEAD</p>
                <h2>Upcoming plan</h2>
            </div>
            ${upcomingDate ? `<span class="muted">${escapeHtml(upcomingDate)}</span>` : ""}
        </div>

        <div class="schedule-card">
            ${
                upcomingPlan && upcomingTasks.length
                    ? upcomingTasks.map(task => `
                        <div class="hour-row">
                            <span class="task-status ${task.completed ? "is-complete" : ""}">
                                ${task.completed ? "✓" : "○"}
                            </span>
                            <span>${escapeHtml(task.name)}</span>
                        </div>
                    `).join("")
                    : `
                        <div class="empty-state">
                            <h3>Nothing planned ahead.</h3>
                            <p>Create a plan for a future day to see it here.</p>
                            <button class="secondary-btn" data-go="planner">
                                Plan ahead
                            </button>
                        </div>
                    `
            }
        </div>
    `;
}

function renderPlanner() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = getDateString(tomorrow);

    pageContent.innerHTML = `
        <div class="welcome">
            <p class="eyebrow">PLAN AHEAD</p>
            <h2>Design your day.</h2>
            <p>Choose your schedule, one hour at a time.</p>
        </div>

        <div class="planner-card">
            <h2>Daily setup</h2>

            <label for="plan-date">Planning date</label>
            <input type="date" id="plan-date" value="${dateString}">

            <div class="time-grid">
                <div>
                    <label for="wake-time">Wake-up time</label>
                    <input type="time" id="wake-time" value="07:00">
                </div>
                <div>
                    <label for="bed-time">Bedtime</label>
                    <input type="time" id="bed-time" value="22:00">
                </div>
            </div>

            <p class="form-hint">
                Choose your day, then add one task for each hour.
            </p>

            <div id="hour-inputs"></div>

            <button class="secondary-btn" id="add-hour">
                + Add another hour
            </button>
            <button class="primary-btn" id="save-plan">
                Save daily plan →
            </button>
            <p id="planner-message" role="status"></p>
        </div>
    `;

    const hourInputs = document.getElementById("hour-inputs");
    const wakeInput = document.getElementById("wake-time");
    const bedInput = document.getElementById("bed-time");
    const dateInput = document.getElementById("plan-date");

    function buildHours() {
        const wakeHour = Number(wakeInput.value.split(":")[0]);
        const bedHour = Number(bedInput.value.split(":")[0]);

        let duration = (bedHour - wakeHour + 24) % 24;
        if (duration === 0) duration = 24;

        const previousValues = [
            ...hourInputs.querySelectorAll(".hour-task")
        ].map(input => input.value);

        hourInputs.innerHTML = "";

        for (let i = 0; i < duration; i++) {
            const hour = (wakeHour + i) % 24;
            const nextHour = (hour + 1) % 24;

            const row = document.createElement("div");
            row.className = "hour-row";

            const label = document.createElement("label");
            label.textContent =
                String(hour).padStart(2, "0") + ":00 – " +
                String(nextHour).padStart(2, "0") + ":00";

            const input = document.createElement("input");
            input.type = "text";
            input.className = "hour-task";
            input.placeholder = "e.g. Study Python";
            input.value = previousValues[i] || "";
            input.maxLength = 100;

            row.append(label, input);
            hourInputs.appendChild(row);
        }
    }

    wakeInput.addEventListener("change", buildHours);
    bedInput.addEventListener("change", buildHours);

    buildHours();

    document.getElementById("add-hour").addEventListener("click", () => {
        const row = document.createElement("div");
        row.className = "hour-row";

        const label = document.createElement("label");
        label.textContent = "Extra hour";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "hour-task";
        input.placeholder = "e.g. Read a book";
        input.maxLength = 100;

        row.append(label, input);
        hourInputs.appendChild(row);
        input.focus();
    });

    document.getElementById("save-plan").addEventListener("click", () => {
        const message = document.getElementById("planner-message");

        if (!dateInput.value) {
            message.textContent = "Please choose a planning date.";
            return;
        }

        const tasks = [
            ...hourInputs.querySelectorAll(".hour-task")
        ].map((input, index) => ({
            name: input.value.trim(),
            slot: index,
            completed: false
        })).filter(task => task.name !== "");

        if (tasks.length === 0) {
            message.textContent = "Add at least one task before saving.";
            return;
        }

        const plan = {
            date: dateInput.value,
            wakeTime: wakeInput.value,
            bedTime: bedInput.value,
            tasks
        };

        try {
            const plans = getPlans();
            plans[plan.date] = plan;
            savePlans(plans);

            message.textContent =
                "Plan saved! Open Tasks to view your schedule.";
        } catch (error) {
            message.textContent =
                "Couldn't save the plan. Check your browser settings.";
        }
    });
}

function renderTasks() {
    const plans = getPlans();
    const todayString = getDateString();
    const dates = Object.keys(plans).sort();

    const plan = plans[todayString] ||
        (dates.length ? plans[dates[dates.length - 1]] : null);

    if (!plan) {
        pageContent.innerHTML = `
            <div class="welcome">
                <p class="eyebrow">YOUR TIMETABLE</p>
                <h2>Today's tasks.</h2>
                <p>You haven't saved a plan yet.</p>
                <button class="primary-btn" data-go="planner">
                    Create your first plan →
                </button>
            </div>
        `;
        return;
    }

    pageContent.innerHTML = `
        <div class="welcome">
            <p class="eyebrow">YOUR TIMETABLE</p>
            <h2>Your planned day.</h2>
            <p>Plan date: ${escapeHtml(plan.date)}</p>
        </div>

        <div class="section-heading">
            <div>
                <p class="eyebrow">YOUR SCHEDULE</p>
                <h2>Scheduled tasks</h2>
            </div>
            <span class="muted" id="task-progress"></span>
        </div>

        <div class="schedule-card" id="task-list"></div>

        <button class="secondary-btn" data-go="planner">
            Create or update a plan
        </button>
    `;

    const taskList = document.getElementById("task-list");

    plan.tasks.forEach((task, index) => {
        const row = document.createElement("div");
        row.className = "hour-row";

        const label = document.createElement("label");
        label.textContent = (index + 1) + ".";

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = Boolean(task.completed);
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as complete"
        );

        const taskName = document.createElement("span");
        taskName.textContent = task.name;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;

            try {
                plans[plan.date] = plan;
                savePlans(plans);
                updateProgress();
            } catch (error) {
                checkbox.checked = !checkbox.checked;
                task.completed = checkbox.checked;
                alert("Couldn't save your change. Check browser storage.");
            }
        });

        wrapper.append(checkbox, taskName);
        row.append(label, wrapper);
        taskList.appendChild(row);
    });

    function updateProgress() {
        const completed = plan.tasks.filter(task => task.completed).length;
        document.getElementById("task-progress").textContent =
            completed + " of " + plan.tasks.length + " tasks completed";
    }

    updateProgress();
}



function renderAnalytics() {
    const plans = JSON.parse(
        localStorage.getItem("hourpilot-plans") || "{}"
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find Monday of this week.
    const thisMonday = new Date(today);
    const day = thisMonday.getDay();
    thisMonday.setDate(
        thisMonday.getDate() - (day === 0 ? 6 : day - 1)
    );

    // Find Monday of last week.
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function getWeekStats(startDate, endDate) {
        let total = 0;
        let completed = 0;

        Object.keys(plans).forEach(date => {
            if (date < dateKey(startDate) || date > dateKey(endDate)) {
                return;
            }

            const tasks = plans[date].tasks || [];
            total += tasks.length;
            completed += tasks.filter(task => task.completed).length;
        });

        return {
            total,
            completed,
            score: total ? Math.round((completed / total) * 100) : null
        };
    }

    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisSunday.getDate() + 6);

    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastSunday.getDate() + 6);

    const thisWeek = getWeekStats(thisMonday, today);
    const lastWeek = getWeekStats(lastMonday, lastSunday);

    let changeText = "Not enough data to compare yet.";
    let changeClass = "";

    if (thisWeek.score !== null && lastWeek.score !== null) {
        if (lastWeek.score === 0) {
            changeText = thisWeek.score > 0
                ? "Productivity improved from 0% last week."
                : "Productivity is unchanged from last week.";
        } else {
            const change = Math.round(
                ((thisWeek.score - lastWeek.score) / lastWeek.score) * 100
            );

            if (change > 0) {
                changeText = `Productivity is ${change}% up since last week.`;
                changeClass = "analytics-up";
            } else if (change < 0) {
                changeText = `Productivity is ${Math.abs(change)}% down since last week.`;
                changeClass = "analytics-down";
            } else {
                changeText = "Productivity is unchanged since last week.";
            }
        }
    } else if (thisWeek.score !== null) {
        changeText = "Your first weekly score is ready. Keep tracking to compare next week.";
    }

    const todayKey = dateKey(today);
    const todayPlan = plans[todayKey];
    const todayTasks = todayPlan ? todayPlan.tasks || [] : [];
    const todayCompleted = todayTasks.filter(task => task.completed).length;
    const todayScore = todayTasks.length
        ? Math.round((todayCompleted / todayTasks.length) * 100)
        : 0;

    const planDates = Object.keys(plans).sort().reverse();

    pageContent.innerHTML = `
        <div class="welcome">
            <p class="eyebrow">YOUR PROGRESS</p>
            <h2>See how far you've come.</h2>
            <p>Your weekly performance, compared with last week.</p>
        </div>

        <div class="section-heading">
            <div>
                <p class="eyebrow">WEEKLY INSIGHT</p>
                <h2>Your productivity trend</h2>
            </div>
        </div>

        <div class="schedule-card analytics-insight">
            <p class="eyebrow">WEEK-OVER-WEEK CHANGE</p>
            <h2 class="${changeClass}">${escapeHtml(changeText)}</h2>
            <p>Based on the percentage of saved tasks completed.</p>
        </div>

        <div class="section-heading schedule-heading">
            <div>
                <p class="eyebrow">WEEKLY SCORE</p>
                <h2>This week vs. last week</h2>
            </div>
        </div>

        <div class="stats-grid">
            <article class="stat-card">
                <p>This week's score</p>
                <h3>${thisWeek.score === null ? "—" : thisWeek.score + "%"} </h3>
                <span>${thisWeek.completed} of ${thisWeek.total} tasks completed</span>
            </article>

            <article class="stat-card">
                <p>Last week's score</p>
                <h3>${lastWeek.score === null ? "—" : lastWeek.score + "%"}</h3>
                <span>${lastWeek.completed} of ${lastWeek.total} tasks completed</span>
            </article>

            <article class="stat-card">
                <p>Today's score</p>
                <h3>${todayScore}%</h3>
                <span>${todayCompleted} of ${todayTasks.length} tasks completed</span>
            </article>
        </div>

        <div class="section-heading schedule-heading">
            <div>
                <p class="eyebrow">YOUR HISTORY</p>
                <h2>Saved plans</h2>
            </div>
            <span class="muted">${planDates.length} plan(s)</span>
        </div>

        <div class="schedule-card">
            ${
                planDates.length
                    ? planDates.map(date => {
                        const tasks = plans[date].tasks || [];
                        const done = tasks.filter(task => task.completed).length;

                        return `
                            <div class="hour-row">
                                <span>◷</span>
                                <span>
                                    ${escapeHtml(date)} —
                                    ${done}/${tasks.length} tasks completed
                                </span>
                            </div>
                        `;
                    }).join("")
                    : `
                        <div class="empty-state">
                            <h3>No saved plans yet.</h3>
                            <p>Save a plan and check off tasks to begin tracking your progress.</p>
                            <button class="secondary-btn" data-go="planner">
                                Plan your day
                            </button>
                        </div>
                    `
            }
        </div>
    `;
}

function renderSettings() {
    const savedTheme = localStorage.getItem("hourpilot-theme") || "light";

    pageContent.innerHTML = `
        <div class="welcome">
            <p class="eyebrow">MAKE IT YOURS</p>
            <h2>Your preferences.</h2>
            <p>Shape HourPilot to match your style.</p>
        </div>

        <div class="settings-card">
            <div class="settings-group">
                <h3>Color theme</h3>
                <p>Choose the overall appearance of HourPilot.</p>

                <select class="setting-select" id="theme-setting">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>
        </div>
    `;

    const themeSetting = document.getElementById("theme-setting");
    themeSetting.value = savedTheme;

    themeSetting.addEventListener("change", () => {
        localStorage.setItem("hourpilot-theme", themeSetting.value);
        applyAppearance();
    });
}


function applyAppearance() {
    const theme = localStorage.getItem("hourpilot-theme") || "light";
    const cardStyle =
        localStorage.getItem("hourpilot-card-style") || "default";

    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle(
        "liquid-glass-theme",
        cardStyle === "liquid-glass"
    );
}

todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
});

applyAppearance();
showPage("home");
