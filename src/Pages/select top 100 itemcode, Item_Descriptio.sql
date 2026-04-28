select top 100  itemcode, Item_Description, AccDescription, * from SalesPerformance_ItemCharge
where customercode like 'MEAJOH%' and item_description like '%Labour%' and year(PostDate) = 2026
