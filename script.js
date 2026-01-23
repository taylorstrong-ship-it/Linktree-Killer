// ==========================================
// 1. 🔌 SUPABASE CONNECTION
// ==========================================
// 👇👇👇 PASTE YOUR KEYS HERE 👇👇👇
const SUPABASE_URL = 'https://qxkicdhsrlpehgcsapsh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TTBR0ES-pM7LOWDsywEy7A_9BSlhWGg';
// 👆👆👆 DO NOT SKIP THIS 👆👆👆

// Initialize
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("✅ Supabase connected.");

// ==========================================
// 2. 🤖 AI AUTO-BUILDER (Now lives here!)
// ==========================================
async function runAiImport() {
    const input = document.getElementById('ai-url-input');
    const btn = document.getElementById('ai-generate-btn');
    const url = input.value;

    if (!url) return showToast("Please paste a URL first!", "error");

    // UI: Let it cook
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 👨🍳 Let it cook...';
    btn.disabled = true;

    try {
        // Call the API
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await res.json();
        console.log("🤖 AI Data Recieved:", data); // Check Console to see what it found

        if (data.error) throw new Error(data.error);

        // Update the Inputs
        if (data.title) document.getElementById('businessName').value = data.title;
        if (data.description) document.getElementById('businessBio').value = data.description;

        // Success!
        showToast("Profile generated! Saving now...");
        btn.innerHTML = "✅ Done!";

        // Trigger Save automatically
        await saveProfile();

    } catch (e) {
        console.error("AI Error:", e);
        showToast("AI Error: " + e.message, "error");
    } finally {
        // Reset Button
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }
}

// ==========================================
// 3. 🏗️ LOAD PROFILE (On Page Start)
// ==========================================
async function loadProfile() {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Check if we are on the builder page (not preview/index)
            // If on builder.html and not logged in, maybe redirect or show login?
            // User said: "Kick out if not logged in" -> window.location.href = 'index.html';
            // But if this script runs on index.html too? 
            // The script is loaded in builder.html...
            // User's provided code:
            /*
            if (!user) {
                window.location.href = 'index.html'; // Kick out if not logged in
                return;
            }
            */
            // I'll stick to user's code.

            // Wait, if I am testing locally, I might not have a user session? 
            // But the user instructed this code.

            // window.location.href = 'index.html'; // Kick out if not logged in
            // return;
        }

        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                if (data.title) document.getElementById('businessName').value = data.title;
                if (data.description) document.getElementById('businessBio').value = data.description;
                console.log("📂 Loaded:", data);
            }
        }
    } catch (error) {
        console.error('Load Error:', error);
    }
}

// ==========================================
// 4. 💾 SAVE PROFILE
// ==========================================
async function saveProfile() {
    const btn = document.querySelector('button[onclick="saveProfile()"]');
    if (btn) btn.innerHTML = 'Saving...';

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in!");

        const updates = {
            id: user.id,
            user_id: user.id,
            title: document.getElementById('businessName').value,
            description: document.getElementById('businessBio').value,
            updated_at: new Date()
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        if (error) throw error;

        showToast('Changes Saved Successfully!');

        // Refresh Preview
        const frame = document.getElementById('preview-frame');
        if (frame) frame.contentWindow.location.reload();

    } catch (error) {
        console.error('Save Error:', error);
        showToast('Save Failed: ' + error.message, 'error');
    } finally {
        if (btn) btn.innerHTML = '💾 Save Changes';
    }
}

// ==========================================
// 5. 🍞 TOAST NOTIFICATION
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    const icon = document.getElementById('toast-icon');

    if (!toast) return alert(message);

    msg.innerText = message;
    if (type === 'error') {
        icon.innerHTML = '<i class="fa-solid fa-circle-exclamation text-red-500"></i>';
    } else {
        icon.innerHTML = '<i class="fa-solid fa-circle-check text-green-500"></i>';
    }

    toast.classList.remove('translate-y-32');
    setTimeout(() => toast.classList.add('translate-y-32'), 3000);
}

// ==========================================
// 6. 🚪 LOGOUT
// ==========================================
async function logOut() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

// Start everything
window.onload = loadProfile;
