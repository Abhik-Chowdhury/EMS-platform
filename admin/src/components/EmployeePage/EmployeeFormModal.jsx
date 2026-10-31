import { useState } from "react";
import { ImagePlus, Lock, Save, Upload, X } from "lucide-react";
import {
  accountOptions,
  departmentOptions,
  genderOptions,
  getTodayDate,
  salaryPeriodOptions,
} from "./employeePageUtils";
import { employeeFormModalStyles as s } from "../../assets/dummyStyles";

const FieldError = ({ children }) =>
  children ? <p className={s.fieldError}>{children}</p> : null;

const EmployeeFormModal = ({
  mode,
  formData,
  formErrors,
  onChange,
  onClose,
  onImageChange,
  onSubmit,
  loading = false,
}) => {
  const isEditMode = mode === "edit";
  const todayDate = getTodayDate();

  // Helper to quickly copy personal email into work email
  const [sameAsPersonalEmail, setSameAsPersonalEmail] = useState(
    Boolean(formData.email && formData.email === formData.workEmail)
  );

  const handleSameEmailToggle = (e) => {
    const checked = e.target.checked;
    setSameAsPersonalEmail(checked);
    if (checked && formData.email) {
      onChange("workEmail", formData.email);
    }
  };

  const handleEmailChange = (value) => {
    onChange("email", value);
    if (sameAsPersonalEmail) {
      onChange("workEmail", value);
    }
  };

  // Ensure image preview only renders if it is a non-empty string
  const hasValidProfileImage = Boolean(formData.profileImage && formData.profileImage.trim() !== "");

  return (
    <div className={s.overlay}>
      <section className={s.container}>
        <div className={s.header}>
          <div>
            <p className={s.headerLabel}>
              {isEditMode ? "Edit Employee" : "New Employee"}
            </p>
            <h2 className={s.headerTitle}>
              {isEditMode ? "Update Employee Details" : "Add Employee Details"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={s.closeButton}
            aria-label="Close employee form"
          >
            <X className={s.closeIcon} />
          </button>
        </div>

        <form onSubmit={onSubmit} className={s.formBody}>
          <div className={s.formGrid}>
            <div>
              <div className={s.getImageContainerClass(formErrors.profileImage)}>
                {hasValidProfileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Employee profile preview"
                    className={s.previewImage}
                  />
                ) : (
                  <ImagePlus className={s.placeholderIcon} />
                )}
              </div>
              <label
                htmlFor="profileImage"
                className={`${s.uploadButton} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Upload className={s.uploadIcon} />
                Upload Photo
              </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={onImageChange}
                className={s.fileInput}
              />
              <FieldError>{formErrors.profileImage}</FieldError>
            </div>

            <div className={s.fieldsGrid}>
              <label className={s.fieldLabel}>
                Employee ID
                <input
                  value={formData.id || ""}
                  disabled={loading}
                  onChange={(event) => onChange("id", event.target.value)}
                  className={s.getInputClass("id", formErrors)}
                  placeholder="EMP-1007"
                />
                <FieldError>{formErrors.id}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Full Name
                <input
                  value={formData.name || ""}
                  disabled={loading}
                  onChange={(event) => onChange("name", event.target.value)}
                  className={s.getInputClass("name", formErrors)}
                  placeholder="Employee name"
                />
                <FieldError>{formErrors.name}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Personal Email
                <input
                  value={formData.email || ""}
                  disabled={loading}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  className={s.getInputClass("email", formErrors)}
                  placeholder="personal@gmail.com"
                  type="email"
                />
                <FieldError>{formErrors.email}</FieldError>
              </label>

              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className={s.fieldLabel}>Work Email</span>
                  <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPersonalEmail}
                      disabled={loading}
                      onChange={handleSameEmailToggle}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    Same as personal
                  </label>
                </div>
                <input
                  value={formData.workEmail || ""}
                  disabled={loading || sameAsPersonalEmail}
                  onChange={(event) => onChange("workEmail", event.target.value)}
                  className={s.getInputClass("workEmail", formErrors)}
                  placeholder="employee@company.com"
                  type="email"
                />
                <FieldError>{formErrors.workEmail}</FieldError>
              </div>

              <label className={s.fieldLabel}>
                Work Password
                <input
                  value={formData.workPassword || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("workPassword", event.target.value)
                  }
                  className={s.getInputClass("workPassword", formErrors)}
                  placeholder="Temporary password"
                  type="text"
                />
                <FieldError>{formErrors.workPassword}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Phone Number
                <input
                  value={formData.phone || ""}
                  disabled={loading}
                  onChange={(event) => onChange("phone", event.target.value)}
                  className={s.getInputClass("phone", formErrors)}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                />
                <FieldError>{formErrors.phone}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Gender
                <select
                  value={formData.gender || ""}
                  disabled={loading}
                  onChange={(event) => onChange("gender", event.target.value)}
                  className={s.getSelectClass("gender", formErrors)}
                >
                  {genderOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className={s.fieldLabel}>
                Department
                <input
                  list="departmentOptions"
                  value={formData.department || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("department", event.target.value)
                  }
                  className={s.getInputClass("department", formErrors)}
                  placeholder="Department"
                />
                <datalist id="departmentOptions">
                  {departmentOptions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                <FieldError>{formErrors.department}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Designation
                <input
                  value={formData.designation || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("designation", event.target.value)
                  }
                  className={s.getInputClass("designation", formErrors)}
                  placeholder="Job role"
                />
                <FieldError>{formErrors.designation}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Salary
                <input
                  value={formData.salary || ""}
                  disabled={loading}
                  onChange={(event) => onChange("salary", event.target.value)}
                  className={s.getInputClass("salary", formErrors)}
                  min="1"
                  placeholder="85000"
                  type="number"
                />
                <FieldError>{formErrors.salary}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Salary Period
                <select
                  value={formData.salaryPeriod || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("salaryPeriod", event.target.value)
                  }
                  className={s.getSelectClass("salaryPeriod", formErrors)}
                >
                  {salaryPeriodOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <FieldError>{formErrors.salaryPeriod}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                <span className={s.joiningDateLabel}>
                  Joining Date
                  {isEditMode && <Lock className={s.lockIcon} />}
                </span>
                <input
                  value={formData.joiningDate || ""}
                  onChange={(event) =>
                    onChange("joiningDate", event.target.value)
                  }
                  className={s.getJoiningDateClass(isEditMode, formErrors)}
                  disabled={isEditMode || loading}
                  min={todayDate}
                  type="date"
                />
                <FieldError>{formErrors.joiningDate}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Bank Name
                <input
                  value={formData.bankName || ""}
                  disabled={loading}
                  onChange={(event) => onChange("bankName", event.target.value)}
                  className={s.getInputClass("bankName", formErrors)}
                  placeholder="HDFC Bank"
                />
                <FieldError>{formErrors.bankName}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Account Number
                <input
                  value={formData.accountNumber || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("accountNumber", event.target.value)
                  }
                  className={s.getInputClass("accountNumber", formErrors)}
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="501234567890"
                />
                <FieldError>{formErrors.accountNumber}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                IFSC Code
                <input
                  value={formData.ifscCode || ""}
                  disabled={loading}
                  onChange={(event) => onChange("ifscCode", event.target.value.toUpperCase())}
                  className={s.getInputClass("ifscCode", formErrors)}
                  maxLength={11}
                  placeholder="HDFC0001234"
                />
                <FieldError>{formErrors.ifscCode}</FieldError>
              </label>

              <label className={s.fieldLabel}>
                Account Status
                <select
                  value={formData.accountStatus || ""}
                  disabled={loading}
                  onChange={(event) =>
                    onChange("accountStatus", event.target.value)
                  }
                  className={s.getSelectClass("accountStatus", formErrors)}
                >
                  {accountOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className={s.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={s.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={s.submitButton}
            >
              {loading ? (
                <>
                  <svg className={s.spinner} fill="none" viewBox="0 0 24 24">
                    <circle
                      className={s.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className={s.spinnerPath}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className={s.submitIcon} />
                  {isEditMode ? "Save Changes" : "Add Employee"}
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default EmployeeFormModal;