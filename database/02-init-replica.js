function tryInitiateRS() {
    let attempts = 0;
    const maxAttempts = 10;
    const delayMS = 1000;

    function sleep(ms) {
        const start = new Date().getTime();
        while (new Date().getTime() - start < ms);
    }

    while (attempts < maxAttempts) {
        try {
            const status = rs.status();
            if (status.ok === 1) {
                print("✅ Replica set already initialized.");
                return;
            }
        } catch (e) {
            print(`⏳ Waiting for Mongo to accept replica set commands... (${attempts + 1}/${maxAttempts})`);
            sleep(delayMS);
            attempts++;
            continue;
        }

        try {
            rs.initiate({
                _id: "rs0",
                members: [{ _id: 0, host: "mongo-c:27017" }]
            });
            print("✅ Replica set initiated successfully.");
            return;
        } catch (err) {
            print("⚠️ Failed to initiate replica set: " + err);
            return;
        }
    }

    print("❌ Timed out waiting for replica set init.");
}

tryInitiateRS();
