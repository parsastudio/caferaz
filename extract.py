import os

def collect_files():
    # ۱. اضافه کردن فرمت‌های جدید به لیست پسوندهای مورد نظر
    target_extensions = ('.js', '.jsx', '.css', '.sql', '.mjs', '.json','tsx','ts','prisma','md')

    # ۲. اضافه کردن .next به لیست پوشه‌های نادیده گرفته شده
    ignore_dirs = {'node_modules', '.git', 'dist', 'build', '.next','scripts','public'}

    # نام فایلی که نباید محتوایش خوانده شود
    ignore_files = {'package-lock.json'}

    output_filename = 'combined_files.txt'

    current_dir = os.getcwd()
    output_path = os.path.join(current_dir, output_filename)

    with open(output_path, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(current_dir):
            # حذف پوشه‌های نادیده گرفته شده از لیست پیمایش
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                # بررسی پسوند فایل و اطمینان از اینکه فایل در لیست حذفیات نیست
                if file.endswith(target_extensions) and file not in ignore_files:
                    full_path = os.path.join(root, file)

                    # محاسبه مسیر نسبی
                    relative_path = os.path.relpath(full_path, current_dir)

                    # نادیده گرفتن خود فایل خروجی اسکریپت
                    if relative_path == output_filename:
                        continue

                    display_path = os.path.join('.', relative_path)

                    outfile.write(f"================================================================\n")
                    outfile.write(f"PATH: {display_path}\n")
                    outfile.write(f"================================================================\n\n")

                    try:
                        with open(full_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"Error reading file: {e}")

                    outfile.write("\n\n" + "-"*64 + "\n\n")

    print(f"Success! Files saved in: {output_filename}")

if __name__ == "__main__":
    collect_files()
