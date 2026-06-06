from fastapi import APIRouter, HTTPException, UploadFile, File
import io

router = APIRouter(prefix="/api/cv", tags=["CV Upload"])


@router.post("/extract")
async def extract_cv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename.lower()
        text = ""

        if filename.endswith(".pdf"):
            try:
                import pdfplumber
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            except Exception:
                import PyPDF2
                reader = PyPDF2.PdfReader(io.BytesIO(content))
                text = "\n".join(p.extract_text() or "" for p in reader.pages)

        elif filename.endswith(".docx"):
            import docx
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs)

        elif filename.endswith(".txt"):
            text = content.decode("utf-8", errors="ignore")

        else:
            raise HTTPException(400, "Sirf PDF, DOCX ya TXT upload karo.")

        if not text.strip():
            raise HTTPException(400, "CV se text extract nahi hua. Manually paste karo.")

        return {"success": True, "text": text.strip(), "filename": file.filename}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Upload error: {str(e)}")
