# 1. Update app/product/[slug]/page.tsx
$prodFile = "c:\Users\Niyas\manbro\app\product\[slug]\page.tsx"
$prodContent = [System.IO.File]::ReadAllText($prodFile)

$prodContent = $prodContent -replace 'bg-black/60', 'bg-[#063914]'
$prodContent = $prodContent -replace 'bg-black/80', 'bg-[#063914]'
$prodContent = $prodContent -replace 'bg-black/30', 'bg-[#032c0f]'
$prodContent = $prodContent -replace 'bg-black\b', 'bg-[#063914]'
$prodContent = $prodContent -replace '#1a1a1a', '#0e471d'
$prodContent = $prodContent -replace '#2a2a2a', '#0e471d'
$prodContent = $prodContent -replace 'bg-white text-black hover:bg-gray-300', 'bg-[#d4af37] text-black font-black hover:bg-[#c29e2e]'
$prodContent = $prodContent -replace 'bg-white text-black border-white', 'bg-[#d4af37] text-black border-[#d4af37]'
$prodContent = $prodContent -replace 'border-white bg-black text-white', 'border-[#d4af37] bg-[#063914] text-[#d4af37]'
$prodContent = $prodContent -replace 'activeImageIndex === idx \? "border-white" : "border-\[#0e471d\]"', 'activeImageIndex === idx ? "border-[#d4af37]" : "border-[#0e471d]"'
$prodContent = $prodContent -replace 'text-xs uppercase font-extrabold tracking-widest text-neutral-400', 'text-xs uppercase font-extrabold tracking-widest text-[#d4af37]'
$prodContent = $prodContent -replace '<span className="text-white">★</span>', '<span className="text-[#d4af37]">★</span>'
$prodContent = $prodContent -replace 'activeTab === "details" \? "border-white text-white"', 'activeTab === "details" ? "border-[#d4af37] text-[#d4af37]"'
$prodContent = $prodContent -replace 'activeTab === "shipping" \? "border-white text-white"', 'activeTab === "shipping" ? "border-[#d4af37] text-[#d4af37]"'
$prodContent = $prodContent -replace 'bg-white text-black font-bold text-xs rounded-lg hover:bg-gray-300', 'bg-[#d4af37] text-black font-black text-xs rounded-lg hover:bg-[#c29e2e]'

[System.IO.File]::WriteAllText($prodFile, $prodContent)
Write-Output "Updated product detail page"

# 2. Update app/checkout/page.tsx
$checkFile = "c:\Users\Niyas\manbro\app\checkout\page.tsx"
$checkContent = [System.IO.File]::ReadAllText($checkFile)

$checkContent = $checkContent -replace 'bg-black/80', 'bg-[#063914]'
$checkContent = $checkContent -replace 'bg-black\b', 'bg-[#063914]'
$checkContent = $checkContent -replace '#1a1a1a', '#0e471d'
$checkContent = $checkContent -replace '#0a0a0a', '#032c0f'
$checkContent = $checkContent -replace 'bg-white text-black', 'bg-[#d4af37] text-black font-black'
$checkContent = $checkContent -replace 'hover:bg-gray-200', 'hover:bg-[#c29e2e]'
$checkContent = $checkContent -replace 'hover:bg-neutral-200', 'hover:bg-[#c29e2e]'
$checkContent = $checkContent -replace 'focus:border-white', 'focus:border-[#d4af37]'
$checkContent = $checkContent -replace 'focus-visible:outline-white', 'focus-visible:outline-[#d4af37]'

[System.IO.File]::WriteAllText($checkFile, $checkContent)
Write-Output "Updated checkout page"

# 3. Update app/track/page.tsx
$trackFile = "c:\Users\Niyas\manbro\app\track\page.tsx"
$trackContent = [System.IO.File]::ReadAllText($trackFile)

$trackContent = $trackContent -replace 'bg-black/80', 'bg-[#063914]'
$trackContent = $trackContent -replace 'bg-black\b', 'bg-[#063914]'
$trackContent = $trackContent -replace '#1a1a1a', '#0e471d'
$trackContent = $trackContent -replace '#0a0a0a', '#032c0f'
$trackContent = $trackContent -replace 'bg-white text-black', 'bg-[#d4af37] text-black font-black'
$trackContent = $trackContent -replace 'hover:bg-neutral-200', 'hover:bg-[#c29e2e]'
$trackContent = $trackContent -replace 'focus:border-white', 'focus:border-[#d4af37]'
$trackContent = $trackContent -replace 'focus-visible:outline-white', 'focus-visible:outline-[#d4af37]'

[System.IO.File]::WriteAllText($trackFile, $trackContent)
Write-Output "Updated track order page"
