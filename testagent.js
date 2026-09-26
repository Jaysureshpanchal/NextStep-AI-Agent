async function test() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/agent/analyse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text:
            "Kal submission hai, laptop dead ho gaya, aur landlord bol raha hai 5 tareekh tak flat khaali karo. Paise bhi nahi hai abhi."
        })
      }
    );

    const data = await response.json();

    console.log(
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exitCode = 1;
  }
}

test();
