import React,{useState} from 'react'

function EditProfile() {

        const [formData, setFormData] = useState({
          name: "Admin",
          title: "Administrator",
          organization: "Ingeniux",
          workPhone: "(509)-123-4567",
          mobilePhone: "(509)-123-4567",
          email: "admin@ingeniux.com",
        });
      
        const handleChange = (e) => {
          setFormData({ ...formData, [e.target.name]: e.target.value });
        };
      
        const handleSubmit = (e) => {
          e.preventDefault();
          console.log("Saved Data:", formData);
        };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-blue-600">Edit your Profile</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="w-24 h-24 rounded-full mb-4 border"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700"
              >
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 grid gap-4">
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Organization:</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Work Phone:</label>
                <input
                  type="tel"
                  name="workPhone"
                  value={formData.workPhone}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Mobile Phone:</label>
                <input
                  type="tel"
                  name="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-600">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex justify-end mt-6 gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile